export function mulDiv(
    a: bigint,
    b: bigint,
    x: bigint,
    rounding: Rounding = Rounding.Floor
): bigint {
    const res = (a * b) / x

    if (rounding === Rounding.Ceil && (a * b) % x > 0) {
        return res + 1n
    }

    return res
}

export enum Rounding {
    Ceil,
    Floor
}
