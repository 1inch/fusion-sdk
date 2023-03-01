import WebSocket from 'ws'
import {
    AnyFunction,
    AnyFunctionWithThis,
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
    RpcEventType,
    WsApiConfig
} from './types'

export const orderEvents: OrderEventType['event'][] = [
    'order_created',
    'order_invalid',
    'order_balance_or_allowance_change',
    'order_filled',
    'order_filled_partially'
]

export class WebSocketApi {
    public ws!: WebSocket

    public url: string

    private initialized: boolean

    constructor(config: WsApiConfig) {
        const castedUrl = castUrl(config.url)
        this.url = `${castedUrl}/v1.0/${config.network}`

        const lazyInit = config.lazyInit || false

        if (!lazyInit) {
            this.initialized = true
            this.ws = new WebSocket(this.url)

            return
        }

        this.initialized = false
    }

    init(): void {
        if (this.initialized) {
            throw new Error('WebSocket is already initialized')
        }

        this.initialized = true
        this.ws = new WebSocket(this.url)
    }

    on(event: string, cb: AnyFunctionWithThis): void {
        this.checkInitialized()
        this.ws.on(event, cb)
    }

    onOpen(cb: AnyFunctionWithThis): void {
        this.on('open', cb)
    }

    off(event: string, cb: AnyFunctionWithThis): void {
        this.checkInitialized()
        this.ws.off(event, cb)
    }

    onPong(cb: OnPongCb): void {
        this.onMessage((data: RpcEventType) => {
            if (data.method === 'ping') {
                cb(data.result)
            }
        })
    }

    send<T>(message: T): void {
        this.checkInitialized()
        const serialized = JSON.stringify(message)
        this.ws.send(serialized)
    }

    onMessage(cb: OnMessageCb): void {
        this.on('message', (data: any) => {
            const parsedData = JSON.parse(data)

            cb(parsedData)
        })
    }

    onClose(cb: AnyFunction): void {
        this.on('close', cb)
    }

    onError(cb: AnyFunction): void {
        this.on('error', cb)
    }

    ping(): void {
        this.send({method: 'ping'})
    }

    close(): void {
        this.checkInitialized()
        this.ws.close()
    }

    getAllowedMethods(): void {
        this.send({method: 'getAllowedMethods'})
    }

    onGetAllowedMethods(cb: OnGetAllowedMethodsCb): void {
        this.onMessage((data: RpcEventType) => {
            if (data.method === 'getAllowedMethods') {
                cb(data.result)
            }
        })
    }

    onOrder(cb: OnOrderCb): void {
        this.onMessage((data: OrderEventType) => {
            if (orderEvents.includes(data.event)) {
                cb(data)
            }
        })
    }

    onOrderCreated(cb: OnOrderCreatedCb): void {
        this.onMessage((data: OrderEventType) => {
            if (data.event === 'order_created') {
                cb(data)
            }
        })
    }

    onOrderInvalid(cb: OnOrderInvalidCb): void {
        this.onMessage((data: OrderEventType) => {
            if (data.event === 'order_invalid') {
                cb(data)
            }
        })
    }

    onOrderBalanceOrAllowanceChange(
        cb: OnOrderNotEnoughBalanceOrAllowanceCb
    ): void {
        this.onMessage((data: OrderEventType) => {
            if (data.event === 'order_balance_or_allowance_change') {
                cb(data)
            }
        })
    }

    onOrderFilled(cb: OnOrderFilledCb): void {
        this.onMessage((data: OrderEventType) => {
            if (data.event === 'order_filled') {
                cb(data)
            }
        })
    }

    onOrderFilledPartially(cb: OnOrderFilledPartiallyCb): void {
        this.onMessage((data: OrderEventType) => {
            if (data.event === 'order_filled_partially') {
                cb(data)
            }
        })
    }

    private checkInitialized(): void {
        if (!this.initialized) {
            throwInitError()
        }
    }
}

function castUrl(url: string): string {
    if (url.startsWith('http')) {
        return url.replace('http', 'ws')
    }

    return url
}

function throwInitError(): void {
    throw new Error('WebSocket is not initialized. Call init() first.')
}
