import {LimitOrderV4Struct} from '@1inch/limit-order-sdk'
import {BlockchainProviderConnector, HttpProviderConnector} from '../connector'
import {NetworkEnum} from '../constants'
import {CustomPreset, PresetEnum} from '../api'
import {FusionOrder} from '../fusion-order'

export type FusionSDKConfigParams = {
    url: string
    network: NetworkEnum
    authKey?: string
    blockchainProvider?: BlockchainProviderConnector
    httpProvider?: HttpProviderConnector
}

export type QuoteParams = {
    fromTokenAddress: string
    toTokenAddress: string
    amount: string
    permit?: string
    takingFeeBps?: number // 100 == 1%
    source?: string
}

export type QuoteCustomPresetParams = {
    customPreset: CustomPreset
}

export type OrderParams = {
    fromTokenAddress: string
    toTokenAddress: string
    amount: string
    walletAddress: string
    permit?: string // without the first 20 bytes of token address
    receiver?: string // by default: walletAddress (makerAddress)
    preset?: PresetEnum // by default: recommended preset
    /**
     * Unique for `walletAddress` can be serial or random generated
     *
     * @see randBigInt
     */
    nonce?: bigint
    fee?: TakingFeeInfo
    source?: string
    customPreset?: CustomPreset
    /**
     * true by default
     */
    allowPartialFills?: boolean

    /**
     * true by default
     */
    allowMultipleFills?: boolean
}

export type TakingFeeInfo = {
    takingFeeBps: number // 100 == 1%
    takingFeeReceiver: string
}

export type OrderInfo = {
    order: LimitOrderV4Struct
    signature: string
    quoteId: string
    orderHash: string
    extension: string
}

export type PreparedOrder = {
    order: FusionOrder
    hash: string
    quoteId: string
}
