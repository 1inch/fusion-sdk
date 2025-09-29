import {Address, LimitOrderV4Struct} from '@1inch/limit-order-sdk'
import {
    BlockchainProviderConnector,
    HttpProviderConnector
} from '../connector/index.js'
import {NetworkEnum} from '../constants.js'
import {CustomPreset, IntegratorFeeParams, PresetEnum} from '../api/index.js'
import {FusionOrder} from '../fusion-order/index.js'

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
    walletAddress?: string
    enableEstimate?: boolean
    permit?: string
    integratorFee?: IntegratorFeeParams
    source?: string
    isPermit2?: boolean
    slippage?: number
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
    source?: string
    isPermit2?: boolean
    customPreset?: CustomPreset
    orderExpirationDelay?: bigint
    /**
     * true by default
     */
    allowPartialFills?: boolean

    /**
     * true by default
     */
    allowMultipleFills?: boolean
    integratorFee?: IntegratorFeeParams
    slippage?: number
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
    nativeOrderFactory?: Address
}
