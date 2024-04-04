import {linearInterpolation} from './calc'
import {RATE_BUMP_DENOMINATOR} from './constants'
import {
    SettlementPostInteractionData,
    AuctionDetails,
    AuctionPoint
} from '../fusion-order'
import {addRatioToAmount} from '../sdk'
import {AuctionGasCostInfo} from '../fusion-order/auction-details/types'

export class AuctionCalculator {
    private static GAS_PRICE_BASE = 1_000_000n // 1000 means 1 Gwei

    constructor(
        private readonly startTime: bigint,
        private readonly duration: bigint,
        private readonly initialRateBump: bigint,
        private readonly points: AuctionPoint[],
        private readonly takerFeeRatio: bigint,
        private readonly gasCost: AuctionGasCostInfo = {
            gasBumpEstimate: 0n,
            gasPriceEstimate: 0n
        }
    ) {}

    static fromAuctionData(
        data: SettlementPostInteractionData,
        details: AuctionDetails
    ): AuctionCalculator {
        return new AuctionCalculator(
            details.startTime,
            details.duration,
            details.initialRateBump,
            details.points,
            data.integratorFee?.ratio || 0n,
            details.gasCost
        )
    }

    static calcInitialRateBump(startAmount: bigint, endAmount: bigint): number {
        const bump =
            (RATE_BUMP_DENOMINATOR * startAmount) / endAmount -
            RATE_BUMP_DENOMINATOR

        return Number(bump)
    }

    /**
     * @see https://github.com/1inch/limit-order-settlement/blob/1b6757eecb2574953b543821db6f7bbff5afee48/contracts/extensions/BaseExtension.sol#L56
     */
    static calcAuctionTakingAmount(
        takingAmount: bigint,
        rate: number,
        takerFeeRatio: bigint
    ): bigint {
        const auctionTakingAmount =
            (BigInt(takingAmount) * (BigInt(rate) + RATE_BUMP_DENOMINATOR)) /
            RATE_BUMP_DENOMINATOR

        if (takerFeeRatio === 0n) {
            return auctionTakingAmount
        }

        return addRatioToAmount(auctionTakingAmount, takerFeeRatio)
    }

    /**
     * Encode estimation `baseFee` as `gasPriceEstimate` for `AuctionGasCostInfo`
     */
    static baseFeeToGasPriceEstimate(baseFee: bigint): bigint {
        return baseFee / AuctionCalculator.GAS_PRICE_BASE
    }

    /**
     * Calculates `gasBumpEstimate` for `AuctionGasCostInfo`
     *
     * @param endTakingAmount min return in destToken
     * @param gasCostInToToken gas cost in destToken
     */
    static calcGasBumpEstimate(
        endTakingAmount: bigint,
        gasCostInToToken: bigint
    ): bigint {
        return (gasCostInToToken * RATE_BUMP_DENOMINATOR) / endTakingAmount
    }

    public calcAuctionTakingAmount(takingAmount: bigint, rate: number): bigint {
        return AuctionCalculator.calcAuctionTakingAmount(
            takingAmount,
            rate,
            this.takerFeeRatio
        )
    }

    /**
     * @see https://github.com/1inch/limit-order-settlement/blob/273defdf7b0f1867299dcbc306f32f035579310f/contracts/extensions/BaseExtension.sol#L121
     * @param time auction timestamp in seconds
     * @param blockBaseFee blockBaseFee in Wei, if passed, then rate will be calculated as if order executed in block with `blockBaseFee`
     */
    public calcRateBump(time: bigint, blockBaseFee = 0n): number {
        const gasBump = this.getGasPriceBump(blockBaseFee)
        const auctionBump = this.getAuctionBump(time)

        const final = auctionBump > gasBump ? auctionBump - gasBump : 0n

        return Number(final)
    }

    private getGasPriceBump(blockBaseFee: bigint): bigint {
        if (
            this.gasCost.gasBumpEstimate === 0n ||
            this.gasCost.gasPriceEstimate === 0n ||
            blockBaseFee === 0n
        ) {
            return 0n
        }

        return (
            (this.gasCost.gasBumpEstimate * blockBaseFee) /
            this.gasCost.gasPriceEstimate /
            AuctionCalculator.GAS_PRICE_BASE
        )
    }

    private getAuctionBump(time: bigint): bigint {
        let cumulativeTime = BigInt(this.startTime)
        const lastTime = BigInt(this.duration) + cumulativeTime
        const startBump = BigInt(this.initialRateBump)

        const currentTime = BigInt(time)

        if (currentTime <= cumulativeTime) {
            return this.initialRateBump
        } else if (currentTime >= lastTime) {
            return 0n
        }

        let prevCoefficient = startBump
        let prevCumulativeTime = cumulativeTime

        for (let i = this.points.length - 1; i >= 0; i--) {
            const {coefficient, delay} = this.points[i]

            cumulativeTime = cumulativeTime + BigInt(delay)
            const coefficientBN = BigInt(coefficient)

            if (cumulativeTime >= currentTime) {
                return linearInterpolation(
                    prevCumulativeTime,
                    cumulativeTime,
                    prevCoefficient,
                    coefficientBN,
                    currentTime
                )
            }

            prevCumulativeTime = cumulativeTime
            prevCoefficient = coefficientBN
        }

        return linearInterpolation(
            prevCumulativeTime,
            lastTime,
            prevCoefficient,
            0n,
            currentTime
        )
    }
}
