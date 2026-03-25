export const ZX = '0x'

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
    UNICHAIN = 130
}

export const ONE_INCH_LIMIT_ORDER_V4_ADDRESSES: Record<NetworkEnum, string> = {
    [NetworkEnum.ZKSYNC]: '0x6fd4383cb451173d5f9304f041c7bcbf27d561ff',
    [NetworkEnum.ETHEREUM]: '0x111111125421ca6dc452d289314280a0f8842a65',
    [NetworkEnum.POLYGON]: '0x111111125421ca6dc452d289314280a0f8842a65',
    [NetworkEnum.BINANCE]: '0x111111125421ca6dc452d289314280a0f8842a65',
    [NetworkEnum.ARBITRUM]: '0x111111125421ca6dc452d289314280a0f8842a65',
    [NetworkEnum.AVALANCHE]: '0x111111125421ca6dc452d289314280a0f8842a65',
    [NetworkEnum.OPTIMISM]: '0x111111125421ca6dc452d289314280a0f8842a65',
    [NetworkEnum.FANTOM]: '0x111111125421ca6dc452d289314280a0f8842a65',
    [NetworkEnum.GNOSIS]: '0x111111125421ca6dc452d289314280a0f8842a65',
    [NetworkEnum.COINBASE]: '0x111111125421ca6dc452d289314280a0f8842a65',
    [NetworkEnum.LINEA]: '0x111111125421ca6dc452d289314280a0f8842a65',
    [NetworkEnum.SONIC]: '0x111111125421ca6dc452d289314280a0f8842a65',
    [NetworkEnum.UNICHAIN]: '0x111111125421ca6dc452d289314280a0f8842a65'
}

export const UINT_160_MAX = (1n << 160n) - 1n
export const UINT_16_MAX = (1n << 16n) - 1n
export const UINT_80_MAX = (1n << 80n) - 1n
export const UINT_40_MAX = (1n << 40n) - 1n
export const UINT_32_MAX = (1n << 32n) - 1n
export const UINT_24_MAX = (1n << 24n) - 1n
export const UINT_256_MAX = (1n << 256n) - 1n
