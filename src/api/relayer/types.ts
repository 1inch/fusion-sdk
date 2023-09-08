import {NetworkEnum} from '../../constants'
import {LimitOrderV3Struct} from '../../limit-order'

export type RelayerRequestParams = {
    order: LimitOrderV3Struct
    signature: string
    quoteId: string
}

export type RelayerApiConfig = {
    network: NetworkEnum
    url: string
    authKey?: string
}
