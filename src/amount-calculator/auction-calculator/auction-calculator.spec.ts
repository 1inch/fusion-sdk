import {parseEther, parseUnits} from 'ethers'
import {AuctionCalculator} from './auction-calculator.js'
import {AuctionDetails} from '../../fusion-order/index.js'

describe('Auction Calculator', () => {
    it('should be created successfully from suffix and salt', () => {
        const auctionStartTime = 1708448252n

        const auctionDetails = new AuctionDetails({
            startTime: auctionStartTime,
            initialRateBump: 50000,
            duration: 120n,
            points: []
        })

        const calculator = AuctionCalculator.fromAuctionData(auctionDetails)

        const rate = calculator.calcRateBump(auctionStartTime + 60n)
        const auctionTakingAmount = calculator.calcAuctionTakingAmount(
            1420000000n,
            rate
        )

        expect(rate).toBe(25000)
        expect(auctionTakingAmount).toBe(1423550000n) // 1423550000 from rate
    })

    describe('Gas bump', () => {
        const now = BigInt(Math.floor(Date.now() / 1000))
        const duration = 1800n // 30m
        const takingAmount = parseEther('1')
        const calculator = new AuctionCalculator(
            now - 60n,
            duration,
            1000000n,
            [{delay: 60, coefficient: 500000}],
            {
                gasBumpEstimate: 10000n, // 0.1% of taking amount
                gasPriceEstimate: 1000n // 1gwei
            }
        )

        it('0 gwei = no gas fee', () => {
            const bump = calculator.calcRateBump(now)
            expect(calculator.calcAuctionTakingAmount(takingAmount, bump)).toBe(
                parseEther('1.05')
            )
        })

        it('0.1 gwei = 0.01% gas fee', () => {
            const bump = calculator.calcRateBump(now, parseUnits('1', 8))
            expect(calculator.calcAuctionTakingAmount(takingAmount, bump)).toBe(
                parseEther('1.0499')
            )
        })

        it('15 gwei = 1.5% gas fee', () => {
            const bump = calculator.calcRateBump(now, parseUnits('15', 9))
            expect(calculator.calcAuctionTakingAmount(takingAmount, bump)).toBe(
                parseEther('1.035')
            )
        })

        it('100 gwei = 10% gas fee, should be capped with takingAmount', () => {
            const bump = calculator.calcRateBump(now, parseUnits('100', 9))
            expect(calculator.calcAuctionTakingAmount(takingAmount, bump)).toBe(
                parseEther('1')
            )
        })
    })
})
