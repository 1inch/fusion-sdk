import {WsProviderConnector} from '../connector/ws'
import {
    OnGetAllowedMethodsCb,
    OnPongCb,
    RpcEventType,
    WsApiConfigWithRequiredProvider
} from './types'

export class RpcWebsocketApi {
    ws!: WsProviderConnector

    constructor(config: WsApiConfigWithRequiredProvider) {
        this.ws = config.provider
    }

    onPong(cb: OnPongCb): void {
        this.ws.onMessage((data: RpcEventType) => {
            if (data.method === 'ping') {
                cb(data.result)
            }
        })
    }

    ping(): void {
        this.ws.send({method: 'ping'})
    }

    getAllowedMethods(): void {
        this.ws.send({method: 'getAllowedMethods'})
    }

    onGetAllowedMethods(cb: OnGetAllowedMethodsCb): void {
        this.ws.onMessage((data: RpcEventType) => {
            if (data.method === 'getAllowedMethods') {
                cb(data.result)
            }
        })
    }
}
