import {Address} from '@1inch/limit-order-sdk'
import {BytesBuilder, BytesIter} from '@1inch/byte-utils'
import assert from 'assert'
import {WhitelistItem} from './types.js'
import {UINT_16_MAX} from '../../constants.js'
import {now} from '../../utils/time.js'
import {add0x} from '../../utils.js'

export class Whitelist {
    private constructor(
        public readonly resolvingStartTime: bigint,
        public readonly whitelist: WhitelistItem[]
    ) {
        assert(whitelist.length, 'whitelist can not be empty')

        whitelist.forEach((w) => {
            assert(w.delay < UINT_16_MAX, 'too big diff between timestamps')
            assert(w.delay >= 0n, 'delay can not be negative')
        })
    }

    public get length(): number {
        return this.whitelist.length
    }

    /**
     * Construct `Whitelist` from BytesIter
     *
     * @param bytes with 0x prefix in next format:
     * - uint32 auctionStartTime
     * - uint8 whitelist size
     * - (bytes10 last10bytesOfAddress, uint16 auctionDelay) * N whitelist info
     */
    static decodeFrom<T extends string | bigint>(
        bytes: BytesIter<T>
    ): Whitelist {
        const whitelist: WhitelistItem[] = []
        const resolvingStartTime = BigInt(bytes.nextUint32())
        const size = BigInt(bytes.nextUint8())

        for (let i = 0; i < size; i++) {
            const addressHalf = BigInt(bytes.nextBytes(10))
                .toString(16)
                .padStart(20, '0')
            const delay = BigInt(bytes.nextUint16())

            whitelist.push({
                addressHalf,
                delay
            })
        }

        return new Whitelist(resolvingStartTime, whitelist)
    }

    /**
     * Construct `Whitelist` from bytes
     *
     * @param bytes with 0x prefix
     * @see decodeFrom
     */
    static decode(bytes: string): Whitelist {
        return Whitelist.decodeFrom(BytesIter.HexString(bytes))
    }

    static new(
        resolvingStartTime: bigint,
        whitelist: {
            address: Address
            /**
             * Timestamp in sec at which address can start resolving
             */
            allowFrom: bigint
        }[]
    ): Whitelist {
        let sumDelay = 0n

        const _whitelist = whitelist
            .map((d) => ({
                addressHalf: d.address.toString().slice(-20),
                allowFrom:
                    d.allowFrom < resolvingStartTime
                        ? resolvingStartTime
                        : d.allowFrom
            }))
            .sort((a, b) => Number(a.allowFrom - b.allowFrom)) // ASC
            .map((val) => {
                const delay = val.allowFrom - resolvingStartTime - sumDelay
                sumDelay += delay

                return {
                    delay,
                    addressHalf: val.addressHalf
                }
            })

        return new Whitelist(resolvingStartTime, _whitelist)
    }

    static fromNow(
        whitelist: {
            address: Address
            /**
             * Timestamp in sec at which address can start resolving
             */
            allowFrom: bigint
        }[]
    ): Whitelist {
        return Whitelist.new(now(), whitelist)
    }

    /**
     * Check whether address allowed to execute order at the given time
     *
     * @param executor address of executor
     * @param executionTime timestamp in sec at which order planning to execute
     */
    public canExecuteAt(executor: Address, executionTime: bigint): boolean {
        const addressHalf = executor.toString().slice(-20)

        let allowedFrom = this.resolvingStartTime

        for (const whitelist of this.whitelist) {
            allowedFrom += whitelist.delay

            if (addressHalf === whitelist.addressHalf) {
                return executionTime >= allowedFrom
            } else if (executionTime < allowedFrom) {
                return false
            }
        }

        return false
    }

    public isExclusivityPeriod(time = now()): boolean {
        if (this.whitelist.length === 1) {
            return true
        }

        if (this.whitelist[0].delay === this.whitelist[1].delay) {
            return false
        }

        return time <= this.resolvingStartTime + this.whitelist[1].delay
    }

    public isExclusiveResolver(wallet: Address): boolean {
        const addressHalf = wallet.toString().slice(-20)

        // only one resolver, so check if it is the passed address
        if (this.whitelist.length === 1) {
            return addressHalf === this.whitelist[0].addressHalf
        }

        // more than 1 address can fill at the same time, no exclusivity
        if (this.whitelist[0].delay === this.whitelist[1].delay) {
            return false
        }

        return addressHalf === this.whitelist[0].addressHalf
    }

    public isWhitelisted(address: Address): boolean {
        const half = address.lastHalf()

        return this.whitelist.some((w) => w.addressHalf === half)
    }

    public encodeInto(
        builder: BytesBuilder = new BytesBuilder()
    ): BytesBuilder {
        builder
            .addUint32(this.resolvingStartTime)
            .addUint8(BigInt(this.whitelist.length))

        // whitelist data
        for (const wl of this.whitelist) {
            builder.addBytes(add0x(wl.addressHalf)).addUint16(wl.delay)
        }

        return builder
    }

    /**
     * Encode whitelist data to 0x prefixed bytes string
     */
    public encode(): string {
        return this.encodeInto().asHex()
    }

    public equal(other: Whitelist): boolean {
        return (
            this.whitelist.length === other.whitelist.length &&
            this.whitelist.every(
                (val, i) =>
                    other.whitelist[i].delay === val.delay &&
                    other.whitelist[i].addressHalf === val.addressHalf
            )
        )
    }
}
