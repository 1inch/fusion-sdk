import {PostInteractionData} from './post-interaction-data'
import {Address} from '../address'
import {bpsToRatioFormat} from '../sdk/utils'

describe('PostInteractionData', () => {
    it('Should encode/decode with no fees and whitelist', () => {
        const data = PostInteractionData.new({
            bankFee: 0n,
            auctionStartTime: 1708117482n,
            whitelist: []
        })

        expect(PostInteractionData.decode(data.encode())).toStrictEqual(data)
    })

    it('Should encode/decode with fees and whitelist', () => {
        const data = PostInteractionData.new({
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

        expect(PostInteractionData.decode(data.encode())).toStrictEqual(data)
    })
})
