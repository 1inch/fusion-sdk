import {NetworkEnum} from '../../constants'
import {LimitOrderV4Struct} from '@1inch/limit-order-sdk'

export type RelayerRequestParams = {
    order: LimitOrderV4Struct
    signature: string
    quoteId: string
}

export type RelayerApiConfig = {
    network: NetworkEnum
    url: string
    authKey?: string
}
