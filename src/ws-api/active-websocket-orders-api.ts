import {WsProviderConnector} from '../connector/ws'
import {orderEvents} from './constants'
import {
    OnOrderCb,
    OnOrderCreatedCb,
    OnOrderFilledCb,
    OnOrderFilledPartiallyCb,
    OnOrderInvalidCb,
    OnOrderNotEnoughBalanceOrAllowanceCb,
    OrderEventType,
    WsApiConfigWithRequiredProvider
} from './types'

export class ActiveOrdersWebSocketApi {
    ws!: WsProviderConnector

    constructor(config: WsApiConfigWithRequiredProvider) {
        this.ws = config.provider
    }

    onOrder(cb: OnOrderCb): void {
        this.ws.onMessage((data: OrderEventType) => {
            if (orderEvents.includes(data.event)) {
                cb(data)
            }
        })
    }

    onOrderCreated(cb: OnOrderCreatedCb): void {
        this.ws.onMessage((data: OrderEventType) => {
            if (data.event === 'order_created') {
                cb(data)
            }
        })
    }

    onOrderInvalid(cb: OnOrderInvalidCb): void {
        this.ws.onMessage((data: OrderEventType) => {
            if (data.event === 'order_invalid') {
                cb(data)
            }
        })
    }

    onOrderBalanceOrAllowanceChange(
        cb: OnOrderNotEnoughBalanceOrAllowanceCb
    ): void {
        this.ws.onMessage((data: OrderEventType) => {
            if (data.event === 'order_balance_or_allowance_change') {
                cb(data)
            }
        })
    }

    onOrderFilled(cb: OnOrderFilledCb): void {
        this.ws.onMessage((data: OrderEventType) => {
            if (data.event === 'order_filled') {
                cb(data)
            }
        })
    }

    onOrderFilledPartially(cb: OnOrderFilledPartiallyCb): void {
        this.ws.onMessage((data: OrderEventType) => {
            if (data.event === 'order_filled_partially') {
                cb(data)
            }
        })
    }
}
