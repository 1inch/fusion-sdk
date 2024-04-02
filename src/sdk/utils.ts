export function bpsToRatioFormat(bps?: number): bigint {
    if (!bps) {
        return 0n
    }

    return BigInt(bps) * 10n
}

export function addRatioToAmount(amount: bigint, ratio: bigint): bigint {
    return amount + (amount * ratio) / 1_000_000_000n
}
