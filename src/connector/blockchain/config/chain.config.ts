import Common, {Hardfork} from '@ethereumjs/common'
import {TxOptions} from '@ethereumjs/tx'
import {NetworkEnum} from '../../../constants'

const polygonNetworkConfig = Common.custom(
    {
        name: 'Polygon',
        networkId: 137,
        chainId: 137
    },
    {hardfork: Hardfork.London}
)

const binanceNetworkConfig = Common.custom({
    name: 'Binance Smart Chain',
    networkId: 56,
    chainId: 56
})

function getChainConfig(network: number): Common | null {
    if (network === NetworkEnum.BINANCE) {
        return binanceNetworkConfig
    } else if (network === NetworkEnum.POLYGON) {
        return polygonNetworkConfig
    }

    return null
}

export function getOptions(
    network: number = NetworkEnum.ETHEREUM
): TxOptions | undefined {
    const config = getChainConfig(network)

    if (!config) {
        return undefined
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return {common: config}
}
