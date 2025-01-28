export type WhitelistItem = {
    /**
     * last 10 bytes of address, no 0x prefix
     */
    addressHalf: string
    /**
     * Delay from previous resolver in seconds
     * For first resolver delay from `resolvingStartTime`
     */
    delay: bigint
}
