import {Address} from '@1inch/limit-order-sdk'
import {UINT_160_MAX} from '@1inch/byte-utils'
import {Whitelist} from './whitelist.js'
import {now} from '../../utils/time.js'

describe('Whitelist', () => {
    it('should encode/decode', () => {
        const whitelist = Whitelist.new(now(), [
            {address: Address.fromBigInt(1n), allowFrom: now() + 10n},
            {address: Address.fromBigInt(UINT_160_MAX), allowFrom: now() + 20n}
        ])

        expect(Whitelist.decode(whitelist.encode())).toEqual(whitelist)
    })

    it('Should generate correct whitelist', () => {
        const start = 1708117482n

        const data = Whitelist.new(start, [
            {
                address: Address.fromBigInt(2n),
                allowFrom: start + 1000n
            },
            {
                address: Address.ZERO_ADDRESS,
                allowFrom: start - 10n // should be set to start
            },
            {
                address: Address.fromBigInt(1n),
                allowFrom: start + 10n
            },
            {
                address: Address.fromBigInt(3n),
                allowFrom: start + 10n
            }
        ])

        expect(data.whitelist).toStrictEqual([
            {
                addressHalf: Address.ZERO_ADDRESS.toString().slice(-20),
                delay: 0n
            },
            {
                addressHalf: Address.fromBigInt(1n).toString().slice(-20),
                delay: 10n
            },
            {
                addressHalf: Address.fromBigInt(3n).toString().slice(-20),
                delay: 0n
            },
            {
                addressHalf: Address.fromBigInt(2n).toString().slice(-20),
                delay: 990n
            }
        ])

        expect(data.canExecuteAt(Address.fromBigInt(1n), start + 10n)).toEqual(
            true
        )
        expect(data.canExecuteAt(Address.fromBigInt(1n), start + 9n)).toEqual(
            false
        )
        expect(data.canExecuteAt(Address.fromBigInt(3n), start + 10n)).toEqual(
            true
        )
        expect(data.canExecuteAt(Address.fromBigInt(3n), start + 9n)).toEqual(
            false
        )
        expect(data.canExecuteAt(Address.fromBigInt(2n), start + 50n)).toEqual(
            false
        )
    })
})
