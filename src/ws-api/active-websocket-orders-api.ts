import {WsProviderConnector} from '../connector/ws'
import {orderEvents} from './constants'
import {
    OnOrderCancelledCb,
    OnOrderCb,
    OnOrderCreatedCb,
    OnOrderFilledCb,
    OnOrderFilledPartiallyCb,
    OnOrderInvalidCb,
    OnOrderNotEnoughBalanceOrAllowanceCb,
    OrderEventType
} from './types'

export class ActiveOrdersWebSocketApi {
    public readonly provider!: WsProviderConnector

    constructor(provider: WsProviderConnector) {
        this.provider = provider
    }

    onOrder(cb: OnOrderCb): void {
        this.provider.onMessage((data: OrderEventType) => {
            if (orderEvents.includes(data.event)) {
                cb(data)
            }
        })
    }

    onOrderCreated(cb: OnOrderCreatedCb): void {
        this.provider.onMessage((data: OrderEventType) => {
            if (data.event === 'order_created') {
                cb(data)
            }
        })
    }

    onOrderInvalid(cb: OnOrderInvalidCb): void {
        this.provider.onMessage((data: OrderEventType) => {
            if (data.event === 'order_invalid') {
                cb(data)
            }
        })
    }

    onOrderBalanceOrAllowanceChange(
        cb: OnOrderNotEnoughBalanceOrAllowanceCb
    ): void {
        this.provider.onMessage((data: OrderEventType) => {
            if (data.event === 'order_balance_or_allowance_change') {
                cb(data)
            }
        })
    }

    onOrderFilled(cb: OnOrderFilledCb): void {
        this.provider.onMessage((data: OrderEventType) => {
            if (data.event === 'order_filled') {
                cb(data)
            }
        })
    }

    onOrderCancelled(cb: OnOrderCancelledCb): void {
        this.provider.onMessage((data: OrderEventType) => {
            if (data.event === 'order_cancelled') {
                cb(data)
            }
        })
    }

    onOrderFilledPartially(cb: OnOrderFilledPartiallyCb): void {
        this.provider.onMessage((data: OrderEventType) => {
            if (data.event === 'order_filled_partially') {
                cb(data)
            }
        })
    }
}
