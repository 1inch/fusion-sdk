const FEE_BASE = 100_000n
const BPS_BASE = 10_000n
const BPS_TO_RATIO_NUMERATOR = FEE_BASE / BPS_BASE

export function bpsToRatioFormat(bps?: number): bigint {
    if (!bps) {
        return 0n
    }

    return BigInt(bps) * BPS_TO_RATIO_NUMERATOR
}

export function addRatioToAmount(amount: bigint, ratio: bigint): bigint {
    return amount + (amount * ratio) / FEE_BASE
}
