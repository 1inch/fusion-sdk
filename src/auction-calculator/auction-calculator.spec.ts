import {AuctionDetails} from '../auction-details'
import {AuctionCalculator} from './auction-calculator'
import {PostInteractionData} from '../post-interaction-data'
import {bpsToRatioFormat} from '../sdk'
import {Address} from '../address'

describe('Auction Calculator', () => {
    it('should be created successfully from suffix and salt', () => {
        const auctionStartTime = 1708448252n

        const postInteraction = PostInteractionData.new({
            integratorFee: {
                ratio: bpsToRatioFormat(1),
                receiver: Address.fromBigInt(1n)
            },
            bankFee: 0n,
            auctionStartTime,
            whitelist: []
        })

        const auctionDetails = new AuctionDetails({
            auctionStartTime,
            initialRateBump: 50000,
            duration: 120,
            points: []
        })

        const calculator = AuctionCalculator.fromAuctionData(
            postInteraction,
            auctionDetails
        )

        const rate = calculator.calcRateBump(Number(auctionStartTime + 60n))
        const auctionTakingAmount = calculator.calcAuctionTakingAmount(
            '1420000000',
            rate
        )

        expect(rate).toBe(25000)
        expect(auctionTakingAmount).toBe('1423692355') // 1423550000 from rate + 142355 (1bps) integrator fee
    })
})
