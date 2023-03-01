import WebSocket from 'ws'
import {
    AnyFunction,
    OnGetAllowedMethodsCb,
    OnMessageCb,
    OnOrderCb,
    OnOrderCreatedCb,
    OnOrderFilledCb,
    OnOrderFilledPartiallyCb,
    OnOrderInvalidCb,
    OnOrderNotEnoughBalanceOrAllowanceCb,
    OnPongCb,
    OrderEventType,
    RpcEventType
} from './types'

const orderEvents: OrderEventType['event'][] = [
    'order_created',
    'order_invalid',
    'order_not_enough_balance_or_allowance',
    'order_filled',
    'order_filled_partially'
]

export class WebSocketSdk {
    public ws: WebSocket

    constructor(url: string) {
        this.ws = new WebSocket(url)
    }

    onOpen = (cb: AnyFunction): void => {
        this.ws.on('open', cb)
    }

    on = (event: string, cb: AnyFunction): void => {
        this.ws.on(event, cb)
    }

    onPong = (cb: OnPongCb): void => {
        this.onMessage((data: RpcEventType) => {
            if (data.method === 'ping') {
                cb(data.result)
            }
        })
    }

    send = <T>(message: T): void => {
        const serialized = JSON.stringify(message)
        this.ws.send(serialized)
    }

    onMessage = (cb: OnMessageCb): void => {
        this.ws.on('message', (data: any) => {
            const parsedData = JSON.parse(data)

            cb(parsedData)
        })
    }

    onClose = (cb: AnyFunction): void => {
        this.ws.on('close', cb)
    }

    onError = (cb: AnyFunction): void => {
        this.ws.on('close', cb)
    }

    ping(): void {
        const message = JSON.stringify({method: 'ping'})

        this.ws.send(message)
    }

    close(): void {
        this.ws.close()
    }

    getAllowedMethods(): void {
        const message = JSON.stringify({method: 'getAllowedMethods'})

        this.ws.send(message)
    }

    onGetAllowedMethods(cb: OnGetAllowedMethodsCb): void {
        this.onMessage((data: RpcEventType) => {
            if (data.method === 'getAllowedMethods') {
                cb(data.result)
            }
        })
    }

    onOrder = (cb: OnOrderCb): void => {
        this.onMessage((data: OrderEventType) => {
            if (orderEvents.includes(data.event)) {
                cb(data)
            }
        })
    }

    onOrderCreated = (cb: OnOrderCreatedCb): void => {
        this.onMessage((data: OrderEventType) => {
            if (data.event === 'order_created') {
                cb(data)
            }
        })
    }

    onOrderInvalid = (cb: OnOrderInvalidCb): void => {
        this.onMessage((data: OrderEventType) => {
            if (data.event === 'order_invalid') {
                cb(data)
            }
        })
    }

    onOrderNotEnoughBalanceOrAllowance = (
        cb: OnOrderNotEnoughBalanceOrAllowanceCb
    ): void => {
        this.onMessage((data: OrderEventType) => {
            if (data.event === 'order_not_enough_balance_or_allowance') {
                cb(data)
            }
        })
    }

    onOrderFilled = (cb: OnOrderFilledCb): void => {
        this.onMessage((data: OrderEventType) => {
            if (data.event === 'order_filled') {
                cb(data)
            }
        })
    }

    onOrderFilledPartially = (cb: OnOrderFilledPartiallyCb): void => {
        this.onMessage((data: OrderEventType) => {
            if (data.event === 'order_filled_partially') {
                cb(data)
            }
        })
    }
}
