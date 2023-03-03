import {
    AnyFunction,
    AnyFunctionWithThis,
    OnMessageCb,
    WebsocketClient,
    WsProviderConnector
} from '../connector/ws'
import {ActiveOrdersWebSocketApi} from './active-websocket-orders-api'
import {RpcWebsocketApi} from './rpc-websocket-api'
import {WsApiConfigWithNetwork} from './types'
import {castUrl} from './url'

export class WebSocketApi {
    public readonly rpc: RpcWebsocketApi

    public readonly order: ActiveOrdersWebSocketApi

    private readonly provider: WsProviderConnector

    constructor(
        configOrProvider: WsApiConfigWithNetwork | WsProviderConnector
    ) {
        if (configOrProvider instanceof WebsocketClient) {
            this.provider = configOrProvider
            this.rpc = new RpcWebsocketApi(configOrProvider)
            this.order = new ActiveOrdersWebSocketApi(configOrProvider)

            return
        }

        const castedConfig = configOrProvider as WsApiConfigWithNetwork

        const url = castUrl(castedConfig.url)
        const urlWithNetwork = `${url}/v1.0/${castedConfig.network}`
        const configWithUrl = {...castedConfig, url: urlWithNetwork}
        const provider = new WebsocketClient(configWithUrl)

        this.provider = provider
        this.rpc = new RpcWebsocketApi(provider)
        this.order = new ActiveOrdersWebSocketApi(provider)
    }

    static new(
        configOrProvider: WsApiConfigWithNetwork | WsProviderConnector
    ): WebSocketApi {
        return new WebSocketApi(configOrProvider)
    }

    init(): void {
        this.provider.init()
    }

    on(event: string, cb: AnyFunctionWithThis): void {
        this.provider.on(event, cb)
    }

    off(event: string, cb: AnyFunctionWithThis): void {
        this.provider.off(event, cb)
    }

    onOpen(cb: AnyFunctionWithThis): void {
        this.provider.onOpen(cb)
    }

    send<T>(message: T): void {
        this.provider.send(message)
    }

    close(): void {
        this.provider.close()
    }

    onMessage(cb: OnMessageCb): void {
        this.provider.onMessage(cb)
    }

    onClose(cb: AnyFunction): void {
        this.provider.onClose(cb)
    }

    onError(cb: AnyFunction): void {
        this.provider.onError(cb)
    }
}
