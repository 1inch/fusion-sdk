import {LimitOrderV3Struct} from '../limit-order'

export type SettlementConfig = {
    resolverContract: string
    settlementContract: string
}

export type FillOrderParams = {
    order: LimitOrderV3Struct
    signature: string
    makingAmount: string
    takingAmount: string
    thresholdAmount: string
    target: string
}

export type FillOrderParamsExtended = FillOrderParams & {interaction: string}

export type CancelOrderParams = {
    salt: string
    makerAsset: string
    takerAsset: string
    maker: string
    receiver: string
    allowedSender: string
    interaction: string
    makingAmount: string
    takingAmount: string
    offsets: string
    target: string
}
