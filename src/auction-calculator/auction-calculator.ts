import {PostInteractionData} from '../post-interaction-data'
import {AuctionDetails, AuctionPoint} from '../auction-details'
import {linearInterpolation} from './calc'
import {RATE_BUMP_DENOMINATOR} from './constants'
import {addRatioToAmount} from '../sdk'

export class AuctionCalculator {
    constructor(
        private readonly startTime: bigint,
        private readonly duration: bigint,
        private readonly initialRateBump: bigint,
        private readonly points: AuctionPoint[],
        private readonly takerFeeRatio: bigint
    ) {}

    static fromAuctionData(
        data: PostInteractionData,
        details: AuctionDetails
    ): AuctionCalculator {
        return new AuctionCalculator(
            data.auctionStartTime,
            details.duration,
            details.initialRateBump,
            details.points,
            data.integratorFee?.ratio || 0n
        )
    }

    /**
     * @see https://github.com/1inch/limit-order-settlement/blob/1b6757eecb2574953b543821db6f7bbff5afee48/contracts/extensions/BaseExtension.sol#L56
     */
    calcAuctionTakingAmount(takingAmount: string, rate: number): string {
        const auctionTakingAmount =
            (BigInt(takingAmount) * (BigInt(rate) + RATE_BUMP_DENOMINATOR)) /
            RATE_BUMP_DENOMINATOR

        if (this.takerFeeRatio === 0n) {
            return auctionTakingAmount.toString()
        }

        return addRatioToAmount(
            auctionTakingAmount,
            this.takerFeeRatio
        ).toString()
    }

    /**
     * @see https://github.com/1inch/limit-order-settlement/blob/1b6757eecb2574953b543821db6f7bbff5afee48/contracts/extensions/BaseExtension.sol#L121
     * @param time auction timestamp in seconds
     */
    calcRateBump(time: number): number {
        let cumulativeTime = BigInt(this.startTime)
        const lastTime = BigInt(this.duration) + cumulativeTime
        const startBump = BigInt(this.initialRateBump)

        const currentTime = BigInt(time)

        if (currentTime <= cumulativeTime) {
            return Number(this.initialRateBump)
        } else if (currentTime >= lastTime) {
            return 0
        }

        let prevCoefficient = startBump
        let prevCumulativeTime = cumulativeTime

        for (let i = this.points.length - 1; i >= 0; i--) {
            const {coefficient, delay} = this.points[i]

            cumulativeTime = cumulativeTime + BigInt(delay)
            const coefficientBN = BigInt(coefficient)

            if (cumulativeTime >= currentTime) {
                const rate = linearInterpolation(
                    prevCumulativeTime,
                    cumulativeTime,
                    prevCoefficient,
                    coefficientBN,
                    currentTime
                )

                return Number(rate)
            }

            prevCumulativeTime = cumulativeTime
            prevCoefficient = coefficientBN
        }

        const rate = linearInterpolation(
            prevCumulativeTime,
            lastTime,
            prevCoefficient,
            0n,
            currentTime
        )

        return Number(rate)
    }
}
