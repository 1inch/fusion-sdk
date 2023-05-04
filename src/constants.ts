export const NATIVE_CURRENCY = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ZERO_NUMBER = '0'
export const ZX = '0x'

export enum NetworkEnum {
    ETHEREUM = 1,
    POLYGON = 137,
    BINANCE = 56,
    ARBITRUM = 42161,
    AVALANCHE = 43114,
    OPTIMISM = 10,
    FANTOM = 250,
    GNOSIS = 100
}

export const WRAPPER_ADDRESS_MAP: Record<NetworkEnum, string> = {
    [NetworkEnum.ETHEREUM]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    [NetworkEnum.BINANCE]: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    [NetworkEnum.POLYGON]: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
    [NetworkEnum.ARBITRUM]: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
    [NetworkEnum.AVALANCHE]: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    [NetworkEnum.OPTIMISM]: '0x4200000000000000000000000000000000000006',
    [NetworkEnum.FANTOM]: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    [NetworkEnum.GNOSIS]: '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'
}

export const UNWRAPPER_CONTRACT_ADDRESS_MAP: Record<NetworkEnum, string> = {
    [NetworkEnum.ETHEREUM]: '0x08b067ad41e45babe5bbb52fc2fe7f692f628b06',
    [NetworkEnum.BINANCE]: '0x0eee00137d807a461702e9e0640c599de663e7e4',
    [NetworkEnum.POLYGON]: '0x18d410f651289bb978fc32f90d2d7e608f4f4560',
    [NetworkEnum.ARBITRUM]: '0x3e57c682c72f3bd255ebf439b74c784bc82029ee',
    [NetworkEnum.AVALANCHE]: '0x5d0ec1f843c1233d304b96dbde0cab9ec04d71ef',
    [NetworkEnum.OPTIMISM]: '0xb33839e05ce9fc53236ae325324a27612f4d110d',
    [NetworkEnum.FANTOM]: '0x94bc2a1c732bcad7343b25af48385fe76e08734f',
    [NetworkEnum.GNOSIS]: '0xd41b24bba51fac0e4827b6f94c0d6ddeb183cd64'
}

export const SETTLEMENT_CONTRACT_ADDRESS_MAP: Record<NetworkEnum, string> = {
    [NetworkEnum.ETHEREUM]: '0xa88800cd213da5ae406ce248380802bd53b47647',
    [NetworkEnum.BINANCE]: '0x1d0ae300eec4093cee4367c00b228d10a5c7ac63',
    [NetworkEnum.POLYGON]: '0x1e8ae092651e7b14e4d0f93611267c5be19b8b9f',
    [NetworkEnum.ARBITRUM]: '0x4bc3e539aaa5b18a82f6cd88dc9ab0e113c63377',
    [NetworkEnum.AVALANCHE]: '0x7731f8df999a9441ae10519617c24568dc82f697',
    [NetworkEnum.OPTIMISM]: '0xd89adc20c400b6c45086a7f6ab2dca19745b89c2',
    [NetworkEnum.FANTOM]: '0xa218543cc21ee9388fa1e509f950fd127ca82155',
    [NetworkEnum.GNOSIS]: '0xcbdb7490968d4dbf183c60fc899c2e9fbd445308'
}

export const ONE_INCH_ROUTER_V5 = '0x1111111254eeb25477b68fb85ed929f73a960582'
