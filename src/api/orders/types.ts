import {LimitOrderV4Struct} from '@1inch/limit-order-sdk'
import {NetworkEnum} from '../../constants'
import {PaginationOutput} from '../types'
import {AuctionPoint} from '../quoter'
import {PaginationParams} from '../pagination'

export type OrdersApiConfig = {
    network: NetworkEnum
    url: string
    authKey?: string
}

export type ActiveOrdersRequestParams = PaginationParams

export type ActiveOrder = {
    quoteId: string
    orderHash: string
    signature: string
    deadline: string
    auctionStartDate: string
    auctionEndDate: string
    remainingMakerAmount: string
    order: LimitOrderV4Struct
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
    order: LimitOrderV4Struct
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
