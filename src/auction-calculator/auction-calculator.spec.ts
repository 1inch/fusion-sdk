import {AuctionSuffix} from '../auction-suffix'
import {AuctionSalt} from '../auction-salt'
import {AuctionCalculator} from './auction-calculator'

describe('Auction Calculator', () => {
    it('should calculate auction rate and taking amount', () => {
        const calculator = AuctionCalculator.fromLimitOrderV3Struct({
            allowedSender: '0x0000000000000000000000000000000000000000',
            interactions:
                '0x000c004e200000000000000000219ab540356cbb839cbe05303d7705faf486570009',
            maker: '0x00000000219ab540356cbb839cbe05303d7705fa',
            makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            makingAmount: '1000000000000000000',
            offsets: '0',
            receiver: '0x0000000000000000000000000000000000000000',
            salt: '45118768841948961586167738353692277076075522015101619148498725069326976558864',
            takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            takingAmount: '1420000000'
        })

        const rate = calculator.calcRateBump(1673548209)

        const auctionTakingAmount = calculator.calcAuctionTakingAmount(
            '1420000000',
            rate
        )

        expect(rate).toBe(14285)
        expect(auctionTakingAmount).toBe('1422028470')
    })

    it('should be created successfully from suffix and salt', () => {
        const suffix = AuctionSuffix.decode(
            '0x000c004e200000000000000000219ab540356cbb839cbe05303d7705faf486570009'
        )
        const salt = AuctionSalt.decode(
            '45118768841948961586167738353692277076075522015101619148498725069326976558864'
        )
        const calculator = AuctionCalculator.fromAuctionData(suffix, salt)

        const rate = calculator.calcRateBump(1673548209)
        const auctionTakingAmount = calculator.calcAuctionTakingAmount(
            '1420000000',
            rate
        )

        expect(rate).toBe(14285)
        expect(auctionTakingAmount).toBe('1422028470')
    })
})
