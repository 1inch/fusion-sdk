export function now(): bigint {
    return BigInt(Math.floor(Date.now() / 1000))
}
