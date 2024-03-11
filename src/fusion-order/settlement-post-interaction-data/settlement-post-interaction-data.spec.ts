import {SettlementPostInteractionData} from './settlement-post-interaction-data'
import {bpsToRatioFormat} from '../../sdk/utils'
import {Address} from '@1inch/limit-order-sdk'

describe('PostInteractionData', () => {
    it('Should encode/decode with no fees and whitelist', () => {
        const data = SettlementPostInteractionData.new({
            bankFee: 0n,
            auctionStartTime: 1708117482n,
            whitelist: []
        })

        expect(
            SettlementPostInteractionData.decode(data.encode())
        ).toStrictEqual(data)
    })

    it('Should encode/decode with fees and whitelist', () => {
        const data = SettlementPostInteractionData.new({
            bankFee: 0n,
            auctionStartTime: 1708117482n,
            whitelist: [
                {
                    address: Address.ZERO_ADDRESS,
                    delay: 0n
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
})
