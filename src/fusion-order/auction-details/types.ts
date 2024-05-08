export type AuctionPoint = {
    /**
     * point in time of this point relatively to previous point
     */
    delay: number
    /**
     * coefficient rate bump from the end of an auction
     */
    coefficient: number
}

export type AuctionGasCostInfo = {
    /**
     * Rate bump to cover gas price.
     * It defined as a ratio of gasCostInToToken to endTakingAmount. 10_000_000 means 100%
     *
     * @see `AuctionCalculator.calcGasBumpEstimate`
     */
    gasBumpEstimate: bigint

    /**
     * Gas price at estimation time. 1000 means 1 Gwei
     */
    gasPriceEstimate: bigint
}
