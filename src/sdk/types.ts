import {BlockchainProviderConnector, HttpProviderConnector} from '../connector'
import {NetworkEnum} from '../constants'
import {LimitOrderV3Struct} from '../limit-order'
import {PresetEnum} from '../api'
import {OrderNonce} from '../nonce-manager/types'
import {FusionOrder} from '../fusion-order'

export type FusionSDKConfigParams = {
    url: string
    network: NetworkEnum
    blockchainProvider?: BlockchainProviderConnector
    httpProvider?: HttpProviderConnector
    wsLazyInit?: boolean
}

export type QuoteParams = {
    fromTokenAddress: string
    toTokenAddress: string
    amount: string
    permit?: string
}

export type OrderParams = {
    fromTokenAddress: string
    toTokenAddress: string
    amount: string
    walletAddress: string
    permit?: string // without first 20 bytes of token address
    receiver?: string // by default: walletAddress (makerAddress)
    preset?: PresetEnum // by default: recommended preset
    nonce?: OrderNonce | string | number // allows to batch cancel orders. by default: not used
}

export type OrderInfo = {
    order: LimitOrderV3Struct
    signature: string
    quoteId: string
    orderHash: string
}

export type PreparedOrder = {
    order: FusionOrder
    hash: string
    quoteId: string
}

export type Nonce = string | number | undefined
