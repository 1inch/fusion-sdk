import {
    AnyFunction,
    AnyFunctionWithThis,
    OnMessageCb,
    WebsocketClient,
    WsProviderConnector
} from '../connector/ws'
import {ActiveOrdersWebSocketApi} from './active-websocket-orders-api'
import {RpcWebsocketApi} from './rpc-websocket-api'
import {WsApiConfigWithProvider} from './types'

export class WebSocketApi {
    public rpc: RpcWebsocketApi

    public order: ActiveOrdersWebSocketApi

    private ws: WsProviderConnector

    constructor(config: WsApiConfigWithProvider) {
        const provider = config.provider || new WebsocketClient(config)

        const configWithProvider = {...config, provider}

        this.ws = provider
        this.rpc = new RpcWebsocketApi(configWithProvider)
        this.order = new ActiveOrdersWebSocketApi(configWithProvider)
    }

    init(): void {
        this.ws.init()
    }

    on(event: string, cb: AnyFunctionWithThis): void {
        this.ws.on(event, cb)
    }

    off(event: string, cb: AnyFunctionWithThis): void {
        this.ws.off(event, cb)
    }

    onOpen(cb: AnyFunctionWithThis): void {
        this.ws.onOpen(cb)
    }

    send<T>(message: T): void {
        this.ws.send(message)
    }

    close(): void {
        this.ws.close()
    }

    onMessage(cb: OnMessageCb): void {
        this.ws.onMessage(cb)
    }

    onClose(cb: AnyFunction): void {
        this.ws.onClose(cb)
    }

    onError(cb: AnyFunction): void {
        this.ws.onError(cb)
    }
}
