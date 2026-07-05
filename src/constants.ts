import {Address} from '@1inch/limit-order-sdk'

export const ZX = '0x'

/**
 * Canonical Uniswap Permit2 contract, same address on all chains
 * @see https://github.com/Uniswap/permit2
 */
export const PERMIT2_ADDRESS = new Address(
    '0x000000000022d473030f116ddee9f6b43ac78ba3'
)

export enum NetworkEnum {
    ETHEREUM = 1,
    POLYGON = 137,
    ZKSYNC = 324,
    BINANCE = 56,
    ARBITRUM = 42161,
    AVALANCHE = 43114,
    OPTIMISM = 10,
    FANTOM = 250,
    GNOSIS = 100,
    COINBASE = 8453,
    LINEA = 59144,
    SONIC = 146,
    UNICHAIN = 130,
    ROBINHOOD = 4663
}

export const ONE_INCH_LIMIT_ORDER_V4 =
    '0x111111125421ca6dc452d289314280a0f8842a65'

export const UINT_160_MAX = (1n << 160n) - 1n
export const UINT_16_MAX = (1n << 16n) - 1n
export const UINT_80_MAX = (1n << 80n) - 1n
export const UINT_40_MAX = (1n << 40n) - 1n
export const UINT_32_MAX = (1n << 32n) - 1n
export const UINT_24_MAX = (1n << 24n) - 1n
export const UINT_256_MAX = (1n << 256n) - 1n
