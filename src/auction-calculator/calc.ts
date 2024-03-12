/**
 *
 *      v2(t-t1) + v1(t2-t)
 * v = ---------------------
 *             t2-t1
 *
 * @see https://github.com/1inch/limit-order-settlement/blob/3c7cf9eacbaf7a60624d7a6f069c59d809f2204a/contracts/libraries/OrderSuffix.sol#L94
 */
export function linearInterpolation(
    t1: bigint,
    t2: bigint,
    v1: bigint,
    v2: bigint,
    t: bigint
): bigint {
    const timePassedFromNow = t - t1
    const timeLeft = t2 - t

    const partialCoefficient = v2 * timePassedFromNow
    const partialPrevCoefficient = v1 * timeLeft

    const coefficient = partialCoefficient + partialPrevCoefficient

    const pointsTimeDiff = t2 - t1

    return coefficient / pointsTimeDiff
}
