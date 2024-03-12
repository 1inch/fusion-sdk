/**
 * Calculates taker amount by linear proportion
 * Note: use for minReturn only, because other amounts calculated based on auction curve
 *
 * @see AuctionCalculator
 * @return Ceiled taker amount
 * @see https://github.com/1inch/limit-order-protocol/blob/23d655844191dea7960a186652307604a1ed480a/contracts/libraries/AmountCalculatorLib.sol#L6
 */
export function calcTakingAmount(
    swapMakerAmount: bigint,
    orderMakerAmount: bigint,
    orderTakerAmount: bigint
): bigint {
    return (
        (swapMakerAmount * orderTakerAmount + orderMakerAmount - 1n) /
        orderMakerAmount
    )
}

/**
 * Calculates maker amount by linear proportion
 * Note: use for minReturn only, because other amounts calculated based on auction curve
 *
 * @see AuctionCalculator
 * @return Floored maker amount
 * @see https://github.com/1inch/limit-order-protocol/blob/23d655844191dea7960a186652307604a1ed480a/contracts/libraries/AmountCalculatorLib.sol#L6
 */
export function calMakingAmount(
    swapTakerAmount: bigint,
    orderMakerAmount: bigint,
    orderTakerAmount: bigint
): bigint {
    return (swapTakerAmount * orderMakerAmount) / orderTakerAmount
}
