import {LimitOrderV4Struct} from '@1inch/limit-order-sdk'
import {NetworkEnum} from '../../constants'

export type RelayerRequestParams = {
    order: LimitOrderV4Struct
    signature: string
    quoteId: string
    extension: string
}

export type RelayerApiConfig = {
    network: NetworkEnum
    url: string
    authKey?: string
}
