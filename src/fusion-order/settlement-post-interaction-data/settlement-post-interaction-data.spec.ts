import {Address} from '@1inch/limit-order-sdk'
import {getBytesCount} from '@1inch/byte-utils'
import {SettlementPostInteractionData} from './settlement-post-interaction-data'
import {bpsToRatioFormat} from '../../sdk/utils'

describe('SettlementPostInteractionData', () => {
    it('Should encode/decode with no fees and whitelist', () => {
        const data = SettlementPostInteractionData.new({
            bankFee: 1n,
            resolvingStartTime: 1708117482n,
            whitelist: [
                {
                    address: Address.ZERO_ADDRESS,
                    allowFrom: 0n
                }
            ]
        })

        const encoded = data.encode()

        expect(getBytesCount(encoded)).toEqual(21n)
        expect(SettlementPostInteractionData.decode(encoded)).toStrictEqual(
            data
        )
    })

    it('Should encode/decode with fees and whitelist', () => {
        const data = SettlementPostInteractionData.new({
            bankFee: 0n,
            resolvingStartTime: 1708117482n,
            whitelist: [
                {
                    address: Address.ZERO_ADDRESS,
                    allowFrom: 0n
                }
            ],
            integratorFee: {
                receiver: Address.ZERO_ADDRESS,
                ratio: bpsToRatioFormat(10)
            }
        })

        expect(
            SettlementPostInteractionData.decode(data.encode())
        ).toStrictEqual(data)
    })

    it('Should generate correct whitelist', () => {
        const start = 1708117482n

        const data = SettlementPostInteractionData.new({
            resolvingStartTime: start,
            whitelist: [
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
            ]
        })

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
