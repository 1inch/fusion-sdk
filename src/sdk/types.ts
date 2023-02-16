import {BlockchainProviderConnector, HttpProviderConnector} from '../connector'
import {NetworkEnum} from '../constants'
import {LimitOrderV3Struct} from '../limit-order'
import {PresetEnum} from '../api'

export type FusionSDKConfigParams = {
    url: string
    network: NetworkEnum
    blockchainProvider?: BlockchainProviderConnector
    httpProvider?: HttpProviderConnector
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
    permit?: string
    receiver?: string // by default: walletAddress (makerAddress)
    preset?: PresetEnum // by default: recommended preset
}

export type OrderInfo = {
    order: LimitOrderV3Struct
    signature: string
    quoteId: string
    orderHash: string
}
