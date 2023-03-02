import WebSocket from 'ws'
import {
    AnyFunction,
    AnyFunctionWithThis,
    OnMessageCb,
    WsApiConfig
} from './types'
import {WsProviderConnector} from './websocket-provider.connector'

export class WebsocketClient implements WsProviderConnector {
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

    off(event: string, cb: AnyFunctionWithThis): void {
        this.checkInitialized()
        this.ws.off(event, cb)
    }

    onOpen(cb: AnyFunctionWithThis): void {
        this.on('open', cb)
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

    close(): void {
        this.checkInitialized()
        this.ws.close()
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
