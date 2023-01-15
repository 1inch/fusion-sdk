import {BigNumber} from '@ethersproject/bignumber'

/**
 *
 *      v2(t-t1) + v1(t2-t)
 * v = ---------------------
 *             t2-t1
 *
 * @see https://github.com/1inch/limit-order-settlement/blob/3c7cf9eacbaf7a60624d7a6f069c59d809f2204a/contracts/libraries/OrderSuffix.sol#L94
 */
export function linearInterpolation(
    t1: BigNumber,
    t2: BigNumber,
    v1: BigNumber,
    v2: BigNumber,
    t: BigNumber
): BigNumber {
    const timePassedFromNow = t.sub(t1)
    const timeLeft = t2.sub(t)

    const partialCoefficient = v2.mul(timePassedFromNow)
    const partialPrevCoefficient = v1.mul(timeLeft)

    const coefficient = partialCoefficient.add(partialPrevCoefficient)

    const pointsTimeDiff = t2.sub(t1)

    return coefficient.div(pointsTimeDiff)
}
