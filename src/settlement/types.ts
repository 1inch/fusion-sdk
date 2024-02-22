import {LimitOrderV4Struct} from '../limit-order'
import {Address} from '../address'

export type SettlementConfig = {
    resolverContract: Address
    settlementExtension: Address
}

export type FillOrderParams = {
    order: LimitOrderV4Struct
    signature: string
    makingAmount: string
    takingAmount: string
    thresholdAmount: string
    target: string
}

export type FillOrderParamsExtended = FillOrderParams & {interaction: string}
