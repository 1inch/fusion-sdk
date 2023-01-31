import {LimitOrderV3Struct} from '../../limit-order'
import {NetworkEnum} from '../../constants'

export type OrdersApiConfig = {
    network: NetworkEnum
    url: string
}

export type ActiveOrdersRequestParams = {
    page?: number
    limit?: number
}

export type ActiveOrder = {
    orderHash: string
    signature: string
    deadline: string
    auctionStartDate: string
    auctionEndDate: string
    order: LimitOrderV3Struct
}

export type ActiveOrdersMeta = {
    totalItems: number
    currentPage: number
    itemsPerPage: number
    totalPages: number
}

export type ActiveOrdersResponse = {
    items: ActiveOrder[]
    meta: ActiveOrdersMeta
}
