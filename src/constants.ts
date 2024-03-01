import {Address} from './address'

export const ZX = '0x'

export enum NetworkEnum {
    ETHEREUM = 1,
    POLYGON = 137,
    BINANCE = 56,
    ARBITRUM = 42161,
    AVALANCHE = 43114,
    OPTIMISM = 10,
    FANTOM = 250,
    GNOSIS = 100,
    COINBASE = 8453
}

// todo: change addresses
export const SETTLEMENT_EXTENSION_ADDRESS_MAP: Record<NetworkEnum, Address> = {
    [NetworkEnum.ETHEREUM]: new Address(
        '0x8273f37417da37c4a6c3995e82cf442f87a25d9c'
    ),
    [NetworkEnum.BINANCE]: new Address(
        '0x1d0ae300eec4093cee4367c00b228d10a5c7ac63'
    ),
    [NetworkEnum.POLYGON]: new Address(
        '0x1e8ae092651e7b14e4d0f93611267c5be19b8b9f'
    ),
    [NetworkEnum.ARBITRUM]: new Address(
        '0x4bc3e539aaa5b18a82f6cd88dc9ab0e113c63377'
    ),
    [NetworkEnum.AVALANCHE]: new Address(
        '0x7731f8df999a9441ae10519617c24568dc82f697'
    ),
    [NetworkEnum.OPTIMISM]: new Address(
        '0xd89adc20c400b6c45086a7f6ab2dca19745b89c2'
    ),
    [NetworkEnum.FANTOM]: new Address(
        '0xa218543cc21ee9388fa1e509f950fd127ca82155'
    ),
    [NetworkEnum.GNOSIS]: new Address(
        '0xcbdb7490968d4dbf183c60fc899c2e9fbd445308'
    ),
    [NetworkEnum.COINBASE]: new Address(
        '0x7f069df72b7a39bce9806e3afaf579e54d8cf2b9'
    )
}

export const ONE_INCH_LIMIT_ORDER_V4 =
    '0x111111125421ca6dc452d289314280a0f8842a65'

export const UINT_160_MAX = (1n << 160n) - 1n
export const UINT_80_MAX = (1n << 80n) - 1n
export const UINT_40_MAX = (1n << 40n) - 1n
export const UINT_32_MAX = (1n << 32n) - 1n
export const UINT_24_MAX = (1n << 24n) - 1n
export const UINT_256_MAX = (1n << 256n) - 1n
