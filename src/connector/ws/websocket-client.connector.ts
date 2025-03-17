import WebSocket from 'ws'
import {
    AnyFunction,
    AnyFunctionWithThis,
    OnMessageCb, OnMessageInputVoidCb,
    WsApiConfig
} from './types'
import {WsProviderConnector} from './websocket-provider.connector'

export class WebsocketClient implements WsProviderConnector {
    public readonly ws!: WebSocket

    private readonly url: string

    private readonly initialized: boolean

    private readonly authKey?: string

    constructor(config: WsApiConfig) {
        this.url = config.url
        this.authKey = config.authKey

        const lazyInit = config.lazyInit || false

        if (!lazyInit) {
            this.initialized = true
            this.ws = new WebSocket(
                this.url,
                this.authKey
                    ? {
                          headers: {
                              Authorization: `Bearer ${this.authKey}`
                          }
                      }
                    : undefined
            )

            return
        }

        this.initialized = false
    }

    init(): void {
        if (this.initialized) {
            throw new Error('WebSocket is already initialized')
        }

        // @ts-expect-error hack for readonly property
        this.initialized = true
        // @ts-expect-error hack for readonly property
        this.ws = new WebSocket(
            this.url,
            this.authKey
                ? {
                      headers: {
                          Authorization: `Bearer ${this.authKey}`
                      }
                  }
                : undefined
        )
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

    ping(): void {
        this.ws.ping()
    }

    onPong(cb: OnMessageInputVoidCb): void {
        this.on('pong', () => {
            cb()
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

function throwInitError(): void {
    throw new Error('WebSocket is not initialized. Call init() first.')
}
