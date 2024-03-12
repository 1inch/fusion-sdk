import {
    OnGetActiveOrdersCb,
    OnGetAllowedMethodsCb,
    OnPongCb,
    RpcEventType
} from './types'
import {PaginationParams, PaginationRequest} from '../api/pagination'
import {WsProviderConnector} from '../connector/ws'

export class RpcWebsocketApi {
    public readonly provider: WsProviderConnector

    constructor(provider: WsProviderConnector) {
        this.provider = provider
    }

    onPong(cb: OnPongCb): void {
        this.provider.onMessage((data: RpcEventType) => {
            if (data.method === 'ping') {
                cb(data.result)
            }
        })
    }

    ping(): void {
        this.provider.send({method: 'ping'})
    }

    getActiveOrders({limit, page}: PaginationParams = {}): void {
        const paginationRequest = new PaginationRequest(page, limit)
        const err = paginationRequest.validate()

        if (err) {
            throw new Error(err)
        }

        this.provider.send({method: 'getActiveOrders', param: {limit, page}})
    }

    onGetActiveOrders(cb: OnGetActiveOrdersCb): void {
        this.provider.onMessage((data: RpcEventType) => {
            if (data.method === 'getActiveOrders') {
                cb(data.result)
            }
        })
    }

    getAllowedMethods(): void {
        this.provider.send({method: 'getAllowedMethods'})
    }

    onGetAllowedMethods(cb: OnGetAllowedMethodsCb): void {
        this.provider.onMessage((data: RpcEventType) => {
            if (data.method === 'getAllowedMethods') {
                cb(data.result)
            }
        })
    }
}
