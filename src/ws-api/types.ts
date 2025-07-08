import {LimitOrderV4Struct} from '@1inch/limit-order-sdk'
import {NetworkEnum} from '../constants.js'
import {WsApiConfig} from '../connector/ws/index.js'
import {PaginationOutput} from '../api/types.js'
import {ActiveOrder} from '../api/orders/index.js'

export type Event<K extends string, T> = {event: K; result: T}

export type OrderEventType =
    | OrderCreatedEvent
    | OrderInvalidEvent
    | OrderBalanceOrAllowanceChangeEvent
    | OrderFilledEvent
    | OrderFilledPartiallyEvent
    | OrderCancelledEvent

export type OrderCreatedEvent = Event<
    'order_created',
    {
        quoteId: string
        orderHash: string
        signature: string
        order: LimitOrderV4Struct
        deadline: string
        auctionStartDate: string
        auctionEndDate: string
        remainingMakerAmount: string
        extension: string
    }
>

export type OrderBalanceOrAllowanceChangeEvent = Event<
    'order_balance_or_allowance_change',
    {
        orderHash: string
        remainingMakerAmount: string
        balance: string
        allowance: string
    }
>

export type OrderInvalidEvent = Event<
    'order_invalid',
    {
        orderHash: string
    }
>

export type OrderCancelledEvent = Event<
    'order_cancelled',
    {
        orderHash: string
    }
>

export type OrderFilledEvent = Event<'order_filled', {orderHash: string}>

export type OrderFilledPartiallyEvent = Event<
    'order_filled_partially',
    {orderHash: string; remainingMakerAmount: string}
>

export type OnOrderCb = (data: OrderEventType) => any

export type OnOrderCreatedCb = (data: OrderCreatedEvent) => any

export type OnOrderInvalidCb = (data: OrderInvalidEvent) => any

export type OnOrderCancelledCb = (data: OrderCancelledEvent) => any

export type OnOrderNotEnoughBalanceOrAllowanceCb = (
    data: OrderBalanceOrAllowanceChangeEvent
) => any

export type OnOrderFilledCb = (data: OrderFilledEvent) => any

export type OnOrderFilledPartiallyCb = (data: OrderFilledPartiallyEvent) => any

export type WsApiConfigWithNetwork = WsApiConfig & {
    network: NetworkEnum
}

export type RpcEvent<T extends RpcMethod, K> = {method: T; result: K}

export type GetAllowMethodsRpcEvent = RpcEvent<'getAllowedMethods', RpcMethod[]>

export type RpcMethod = 'getAllowedMethods' | 'ping' | 'getActiveOrders'

export type RpcEventType =
    | PingRpcEvent
    | GetAllowMethodsRpcEvent
    | GetActiveOrdersRpcEvent

export type PingRpcEvent = RpcEvent<'ping', string>

export type GetActiveOrdersRpcEvent = RpcEvent<
    'getActiveOrders',
    PaginationOutput<ActiveOrder>
>

export type OnPongCb = (data: PingRpcEvent['result']) => any

export type OnGetAllowedMethodsCb = (
    data: GetAllowMethodsRpcEvent['result']
) => any

export type OnGetActiveOrdersCb = (
    data: GetActiveOrdersRpcEvent['result']
) => any
