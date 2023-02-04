import {LimitOrderV3Struct} from '../../limit-order'
import {NetworkEnum} from '../../constants'
import {PaginationOutput} from '../types'
import {AuctionPoint} from '../quoter'
import {PaginationParams} from '../pagination'

export type OrdersApiConfig = {
    network: NetworkEnum
    url: string
}

export type ActiveOrdersRequestParams = PaginationParams

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

export enum OrderStatus {
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
    txHash: string
    filledMakerAmount: string
    filledAuctionTakerAmount: string
}

export type OrderStatusResponse = {
    status: OrderStatus
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
} & PaginationParams

export type OrderFillsByMakerOutput = {
    orderHash: string
    status: OrderStatus
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
