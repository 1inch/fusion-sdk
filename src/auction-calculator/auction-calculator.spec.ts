import {Address} from '@1inch/limit-order-sdk'
import {parseEther, parseUnits} from 'ethers'
import {AuctionCalculator} from './auction-calculator'
import {SettlementPostInteractionData, AuctionDetails} from '../fusion-order'
import {bpsToRatioFormat} from '../sdk'

describe('Auction Calculator', () => {
    it('should be created successfully from suffix and salt', () => {
        const auctionStartTime = 1708448252n

        const postInteraction = SettlementPostInteractionData.new({
            integratorFee: {
                ratio: bpsToRatioFormat(1),
                receiver: Address.fromBigInt(1n)
            },
            bankFee: 0n,
            resolvingStartTime: auctionStartTime,
            whitelist: [
                {address: Address.ZERO_ADDRESS, allowFrom: auctionStartTime}
            ]
        })

        const auctionDetails = new AuctionDetails({
            startTime: auctionStartTime,
            initialRateBump: 50000,
            duration: 120n,
            points: []
        })

        const calculator = AuctionCalculator.fromAuctionData(
            postInteraction,
            auctionDetails
        )

        const rate = calculator.calcRateBump(auctionStartTime + 60n)
        const auctionTakingAmount = calculator.calcAuctionTakingAmount(
            1420000000n,
            rate
        )

        expect(rate).toBe(25000)
        expect(auctionTakingAmount).toBe(1423692355n) // 1423550000 from rate + 142355 (1bps) integrator fee
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
            0n,
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
