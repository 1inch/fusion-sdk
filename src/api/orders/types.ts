import {LimitOrderV3Struct} from '../../limit-order'
import {NetworkEnum} from '../../constants'
import {PaginationOutput} from '../../types'
import {AuctionPoint} from '../quoter'

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

export type ActiveOrdersResponse = PaginationOutput<ActiveOrder>

export type OrderStatusParams = {
    orderHash: string
}

export enum OrderStatusMapped {
    Pending = 'pending',
    Filled = 'filled',
    FalsePredicate = 'false-predicate',
    NotEnoughBalanceOrAllowance = 'not-enough-balance-or-allowance',
    Expired = 'expired',
    PartiallyFilled = 'partially-filled',
    WrongPermit = 'wrong-permit',
    Cancelled = 'cancelled',
    InvalidSignature = 'invalid-signature'
}

export type Fill = {
    txHash: string | null
    filledMakerAmount: string | null
    filledAuctionTakerAmount: string | null
}

export type OrderStatusResponse = {
    status: OrderStatusMapped
    order: LimitOrderV3Struct
    points: AuctionPoint[] | null
    fills: Fill[]
    auctionStartDate: number
    auctionDuration: number
    initialRateBump: number
    isNativeCurrency: boolean
}

export type OrdersByMakerParams = {
    address: string
} & OrdersByMakerQueryParams

export type OrdersByMakerQueryParams = {
    page?: number
    limit?: number
}

export type OrderFillsByMakerOutput = {
    orderHash: string
    status: OrderStatusMapped
    makerAsset: string
    makerAmount: string
    takerAsset: string
    cancelTx: string | null
    fills: Fill[]
    points: AuctionPoint[] | null
    auctionStartDate: number
    auctionDuration: number
    initialRateBump: number
    isNativeCurrency: boolean
}

export type OrdersByMakerResponse = PaginationOutput<OrderFillsByMakerOutput>
