export const NATIVE_CURRENCY = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000'
export const ZX = '0x'

export enum NetworkEnum {
    ETHEREUM = 1,
    POLYGON = 137,
    BINANCE = 56
}

export const WRAPPER_ADDRESS_MAP: Record<NetworkEnum, string> = {
    [NetworkEnum.ETHEREUM]: '',
    [NetworkEnum.BINANCE]: '',
    [NetworkEnum.POLYGON]: ''
}

export const UNWRAPPER_CONTRACT_ADDRESS_MAP: Record<NetworkEnum, string> = {
    [NetworkEnum.ETHEREUM]: '',
    [NetworkEnum.BINANCE]: '',
    [NetworkEnum.POLYGON]: ''
}
