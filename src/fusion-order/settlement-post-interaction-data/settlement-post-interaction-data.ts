import {ethers} from 'ethers'
import {Address} from '@1inch/limit-order-sdk'
import {BytesIter} from '@1inch/byte-utils'
import assert from 'assert'
import {IntegratorFee, SettlementSuffixData} from './types'
import {isHexBytes} from '../../validations'
import {add0x} from '../../utils'

export class SettlementPostInteractionData {
    public readonly whitelist: WhitelistItem[]

    public readonly integratorFee?: IntegratorFee

    public readonly bankFee: bigint

    public readonly auctionStartTime: bigint

    private constructor(data: {
        whitelist: WhitelistItem[]
        integratorFee?: IntegratorFee
        bankFee: bigint
        auctionStartTime: bigint
    }) {
        this.whitelist = data.whitelist
        this.integratorFee = data?.integratorFee
        this.bankFee = data.bankFee
        this.auctionStartTime = data.auctionStartTime
    }

    static new(data: SettlementSuffixData): SettlementPostInteractionData {
        return new SettlementPostInteractionData({
            ...data,
            whitelist: data.whitelist.map((d) => ({
                addressHalf: d.address.toString().slice(-20),
                delay: d.delay
            }))
        })
    }

    /**
     * Construct `PostInteractionData` from bytes
     * @param data bytes with 0x prefix in next format:
     * - uint8 feeType, first bit enabled when fee bank exists, second bit enabled when integrator fee exists
     * - [uint32 feeBank] only when first bit of feeType enabled
     * - [uint160 integratorFeeReceiver, uint32 integratorFeeRation] only when second bit of feeType enabled
     * - uint32 auctionStartTime
     * - (bytes10 last10bytesOfAddress, uint16 auctionDelay) * N whitelist info
     *
     * All data is tight packed
     *
     * @see SettlementPostInteractionData.encode
     */
    static decode(data: string): SettlementPostInteractionData {
        assert(
            isHexBytes(data),
            'Post interaction data must be valid bytes string'
        )

        const iter = BytesIter.BigInt(data)

        const feeType = iter.nextByte()
        let bankFee = 0n
        let integratorFee: IntegratorFee | undefined

        // fee bank presented
        if ((feeType & 1n) === 1n) {
            bankFee = iter.nextUint32()
        }

        // integrator fee presented
        if ((feeType & 2n) === 2n) {
            const integratorAddress = iter.nextUint160()
            const integratorFeeRatio = iter.nextUint32()

            integratorFee = {
                ratio: integratorFeeRatio,
                receiver: Address.fromBigInt(integratorAddress)
            }
        }

        const auctionStartTime = iter.nextUint32()

        const whitelist = [] as WhitelistItem[]

        while (!iter.isEmpty()) {
            const addressHalf = iter
                .nextBytes(10)
                .toString(16)
                .padStart(20, '0')
            const allowance = iter.nextUint16()

            whitelist.push({
                addressHalf,
                delay: allowance
            })
        }

        return new SettlementPostInteractionData({
            integratorFee,
            bankFee,
            auctionStartTime,
            whitelist
        })
    }

    /**
     * Serialize post-interaction data to bytes
     */
    public encode(): string {
        const fee = {
            type: 'uint8',
            value: 0n
        }

        const data = [fee] as {type: string; value: string | bigint}[]

        // Add bank fee if exists
        if (this.bankFee) {
            fee.value |= 1n
            data.push({
                type: 'uint32',
                value: ethers.solidityPacked(['uint32'], [this.bankFee])
            })
        }

        // add integrator fee if exists
        if (this.integratorFee?.ratio) {
            fee.value |= 2n
            data.push(
                {
                    type: 'uint160',
                    value: ethers.solidityPacked(
                        ['uint160'],
                        [this.integratorFee.receiver.toString()]
                    )
                },
                {
                    type: 'uint32',
                    value: ethers.solidityPacked(
                        ['uint32'],
                        [this.integratorFee.ratio]
                    )
                }
            )
        }

        data.push({
            type: 'uint32',
            value: this.auctionStartTime
        })

        // whitelist data
        for (const wl of this.whitelist) {
            data.push(
                {
                    type: 'bytes10',
                    value: add0x(wl.addressHalf)
                },
                {
                    type: 'uint16',
                    value: BigInt(wl.delay)
                }
            )
        }

        return ethers.solidityPacked(
            data.map((d) => d.type),
            data.map((d) => d.value)
        )
    }
}

type WhitelistItem = {
    /**
     * last 10 bytes of address, no 0x prefix
     */
    addressHalf: string
    /**
     * Delay from auction start in seconds
     */
    delay: bigint
}
