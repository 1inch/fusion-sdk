import {
    ActiveOrdersRequest,
    OrdersByMakerRequest,
    OrderStatusRequest
} from './orders.request'
import {
    ActiveOrdersResponse,
    OrdersApiConfig,
    OrdersByMakerResponse,
    OrderStatusResponse
} from './types'
import {AxiosProviderConnector, HttpProviderConnector} from '../../connector'
import {concatQueryParams} from '../params'
import {Version, VERSION} from '../version'

export class OrdersApi {
    private static Version = 'v2.0'

    constructor(
        private readonly config: OrdersApiConfig,
        private readonly httpClient: HttpProviderConnector
    ) {}

    static new(
        config: OrdersApiConfig,
        httpClient: HttpProviderConnector = new AxiosProviderConnector(
            config.authKey
        )
    ): OrdersApi {
        return new OrdersApi(config, httpClient)
    }

    async getActiveOrders(
        params: ActiveOrdersRequest,
        version: Version
    ): Promise<ActiveOrdersResponse> {
        const err = params.validate()

        if (err) {
            throw new Error(err)
        }

        const queryParams = concatQueryParams(params.build(), version)
        const url = `${this.config.url}/${OrdersApi.Version}/${this.config.network}/order/active/${queryParams}`

        return this.httpClient.get<ActiveOrdersResponse>(url)
    }

    async getOrderStatus(
        params: OrderStatusRequest
    ): Promise<OrderStatusResponse> {
        const err = params.validate()

        if (err) {
            throw new Error(err)
        }

        const url = `${this.config.url}/${OrdersApi.Version}/${this.config.network}/order/status/${params.orderHash}?version=${VERSION}`

        return this.httpClient.get<OrderStatusResponse>(url)
    }

    async getOrdersByMaker(
        params: OrdersByMakerRequest,
        version: Version
    ): Promise<OrdersByMakerResponse> {
        const err = params.validate()

        if (err) {
            throw new Error(err)
        }

        const qp = concatQueryParams(params.buildQueryParams(), version)
        const url = `${this.config.url}/${OrdersApi.Version}/${this.config.network}/order/maker/${params.address}/${qp}`

        return this.httpClient.get(url)
    }
}
