export const NATIVE_CURRENCY = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ZX = '0x'

export enum NetworkEnum {
    ETHEREUM = 1,
    POLYGON = 137,
    BINANCE = 56
}

export const WRAPPER_ADDRESS_MAP: Record<NetworkEnum, string> = {
    [NetworkEnum.ETHEREUM]: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    [NetworkEnum.BINANCE]: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
    [NetworkEnum.POLYGON]: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
}

export const UNWRAPPER_CONTRACT_ADDRESS_MAP: Record<NetworkEnum, string> = {
    [NetworkEnum.ETHEREUM]: '0x08b067ad41e45babe5bbb52fc2fe7f692f628b06',
    [NetworkEnum.BINANCE]: '0x0eee00137d807a461702e9e0640c599de663e7e4',
    [NetworkEnum.POLYGON]: '0x18d410f651289bb978fc32f90d2d7e608f4f4560'
}
