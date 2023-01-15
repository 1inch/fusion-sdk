import {
    AuctionPoint,
    AuctionSuffix,
    CONTRACT_TAKER_FEE_PRECISION
} from '../auction-suffix'
import {LimitOrderV3Struct} from '../limit-order'
import {AuctionSalt} from '../auction-salt'
import {BigNumber} from '@ethersproject/bignumber'
import {linearInterpolation} from './calc'
import {RATE_BUMP_DENOMINATOR} from './constants'

export class AuctionCalculator {
    constructor(
        private readonly startTime: number,
        private readonly duration: number,
        private readonly initialRateBump: number,
        private readonly points: AuctionPoint[],
        private readonly takerFeeRatio: string
    ) {}

    static fromLimitOrderV3Struct(
        order: LimitOrderV3Struct
    ): AuctionCalculator {
        const suffix = AuctionSuffix.decode(order.interactions)
        const salt = AuctionSalt.decode(order.salt)

        return AuctionCalculator.fromAuctionData(suffix, salt)
    }

    static fromAuctionData(
        suffix: AuctionSuffix,
        salt: AuctionSalt
    ): AuctionCalculator {
        return new AuctionCalculator(
            salt.auctionStartTime,
            salt.duration,
            salt.initialRateBump,
            suffix.points,
            suffix.takerFeeRatio
        )
    }

    calcAuctionTakingAmount(takingAmount: string, rate: number): string {
        const auctionTakingAmount = BigNumber.from(takingAmount)
            .mul(BigNumber.from(rate).add(RATE_BUMP_DENOMINATOR))
            .div(RATE_BUMP_DENOMINATOR)

        if (this.takerFeeRatio === '0') {
            return auctionTakingAmount.toString()
        }

        return auctionTakingAmount
            .add(
                auctionTakingAmount
                    .mul(this.takerFeeRatio)
                    .div(CONTRACT_TAKER_FEE_PRECISION)
            )
            .toString()
    }

    /**
     * @see https://github.com/1inch/limit-order-settlement/blob/3c7cf9eacbaf7a60624d7a6f069c59d809f2204a/contracts/libraries/OrderSuffix.sol#L75
     * @param time auction timestamp in seconds
     */
    calcRateBump(time: number): number {
        let cumulativeTime = BigNumber.from(this.startTime)
        const lastTime = BigNumber.from(this.duration).add(cumulativeTime)
        const startBump = BigNumber.from(this.initialRateBump)

        const currentTime = BigNumber.from(time)

        if (currentTime.lte(cumulativeTime)) {
            return this.initialRateBump
        } else if (currentTime.gte(lastTime)) {
            return 0
        }

        let prevCoefficient = startBump
        let prevCumulativeTime = cumulativeTime

        for (let i = this.points.length - 1; i >= 0; i--) {
            const {coefficient, delay} = this.points[i]

            cumulativeTime = cumulativeTime.add(delay)
            const coefficientBN = BigNumber.from(coefficient)

            if (cumulativeTime.gt(currentTime)) {
                const rate = linearInterpolation(
                    prevCumulativeTime,
                    cumulativeTime,
                    prevCoefficient,
                    coefficientBN,
                    currentTime
                )

                return rate.toNumber()
            }

            prevCumulativeTime = cumulativeTime
            prevCoefficient = coefficientBN
        }

        const rate = linearInterpolation(
            prevCumulativeTime,
            lastTime,
            prevCoefficient,
            BigNumber.from(0),
            currentTime
        )

        return rate.toNumber()
    }
}
