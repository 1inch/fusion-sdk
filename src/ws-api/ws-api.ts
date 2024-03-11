import {ActiveOrdersWebSocketApi} from './active-websocket-orders-api'
import {RpcWebsocketApi} from './rpc-websocket-api'
import {WsApiConfigWithNetwork} from './types'
import {castUrl} from './url'
import {
    AnyFunction,
    AnyFunctionWithThis,
    OnMessageCb,
    WebsocketClient,
    WsProviderConnector
} from '../connector/ws'

export class WebSocketApi {
    public readonly rpc: RpcWebsocketApi

    public readonly order: ActiveOrdersWebSocketApi

    public readonly provider: WsProviderConnector

    constructor(
        configOrProvider: WsApiConfigWithNetwork | WsProviderConnector
    ) {
        if (instanceOfWsApiConfigWithNetwork(configOrProvider)) {
            const url = castUrl(configOrProvider.url)
            const urlWithNetwork = `${url}/v1.0/${configOrProvider.network}`
            const configWithUrl = {...configOrProvider, url: urlWithNetwork}
            const provider = new WebsocketClient(configWithUrl)

            this.provider = provider
            this.rpc = new RpcWebsocketApi(provider)
            this.order = new ActiveOrdersWebSocketApi(provider)

            return
        }

        this.provider = configOrProvider
        this.rpc = new RpcWebsocketApi(configOrProvider)
        this.order = new ActiveOrdersWebSocketApi(configOrProvider)
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

function instanceOfWsApiConfigWithNetwork(
    val: WsApiConfigWithNetwork | WsProviderConnector
): val is WsApiConfigWithNetwork {
    return 'url' in val && 'network' in val
}
