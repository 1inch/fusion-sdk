import './global.d.ts'

export const now = (): bigint => BigInt(Math.floor(Date.now() / 1000))
