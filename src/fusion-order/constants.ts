import {Address} from '@1inch/limit-order-sdk'
import {NetworkEnum} from '../constants'

export const CHAIN_TO_WRAPPER = {
    [NetworkEnum.ETHEREUM]: new Address(
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    ),
    [NetworkEnum.BINANCE]: new Address(
        '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c'
    ),
    [NetworkEnum.POLYGON]: new Address(
        '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'
    ),
    [NetworkEnum.ARBITRUM]: new Address(
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1'
    ),
    [NetworkEnum.AVALANCHE]: new Address(
        '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
    ),
    [NetworkEnum.GNOSIS]: new Address(
        '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d'
    ),
    [NetworkEnum.COINBASE]: new Address(
        '0x4200000000000000000000000000000000000006'
    ),
    [NetworkEnum.OPTIMISM]: new Address(
        '0x4200000000000000000000000000000000000006'
    ),
    [NetworkEnum.FANTOM]: new Address(
        '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83'
    ),
    [NetworkEnum.ZKSYNC]: new Address(
        '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91'
    ),
    [NetworkEnum.LINEA]: new Address(
        '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f'
    ),
    [NetworkEnum.SONIC]: new Address(
        '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38'
    ),
    [NetworkEnum.UNICHAIN]: new Address(
        '0x4200000000000000000000000000000000000006'
    )
}
