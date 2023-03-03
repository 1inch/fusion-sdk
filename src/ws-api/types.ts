import {LimitOrderV3Struct} from '../limit-order'
import {NetworkEnum} from '../constants'
import {WsApiConfig} from '../connector/ws'

export type Event<K extends string, T> = {event: K; data: T}

export type OrderEventType =
    | OrderCreatedEvent
    | OrderInvalidEvent
    | OrderBalanceOrAllowanceChangeEvent
    | OrderFilledEvent
    | OrderFilledPartiallyEvent

export type OrderCreatedEvent = Event<
    'order_created',
    {
        orderHash: string
        signature: string
        order: LimitOrderV3Struct
        deadline: string
        auctionStartDate: string
        auctionEndDate: string
        remainingMakerAmount: string
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

export type OrderFilledEvent = Event<'order_filled', {orderHash: string}>

export type OrderFilledPartiallyEvent = Event<
    'order_filled_partially',
    {orderHash: string; remainingMakerAmount: string}
>

export type OnOrderCb = (data: OrderEventType) => any

export type OnOrderCreatedCb = (data: OrderCreatedEvent) => any

export type OnOrderInvalidCb = (data: OrderInvalidEvent) => any

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

export type RpcMethod = 'getAllowedMethods' | 'ping'

export type RpcEventType = PingRpcEvent | GetAllowMethodsRpcEvent

export type PingRpcEvent = RpcEvent<'ping', string>

export type OnPongCb = (data: PingRpcEvent['result']) => any

export type OnGetAllowedMethodsCb = (
    data: GetAllowMethodsRpcEvent['result']
) => any
