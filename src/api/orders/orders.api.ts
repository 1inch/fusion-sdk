import {
    ActiveOrdersRequest,
    OrdersByMakerRequest,
    OrderStatusRequest
} from './orders.request.js'
import {
    ActiveOrdersResponse,
    OrdersApiConfig,
    OrdersByMakerResponse,
    OrderStatusResponse
} from './types.js'
import {
    AxiosProviderConnector,
    HttpProviderConnector
} from '../../connector/index.js'
import {concatQueryParams} from '../params.js'
import {OrdersVersion} from '../ordersVersion.js'

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
        ordersVersion: OrdersVersion
    ): Promise<ActiveOrdersResponse> {
        const err = params.validate()

        if (err) {
            throw new Error(err)
        }

        const queryParams = concatQueryParams(params.build(), ordersVersion)
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

        const url = `${this.config.url}/${OrdersApi.Version}/${this.config.network}/order/status/${params.orderHash}`

        return this.httpClient.get<OrderStatusResponse>(url)
    }

    async getOrdersByMaker(
        params: OrdersByMakerRequest,
        ordersVersion: OrdersVersion
    ): Promise<OrdersByMakerResponse> {
        const err = params.validate()

        if (err) {
            throw new Error(err)
        }

        const qp = concatQueryParams(params.buildQueryParams(), ordersVersion)
        const url = `${this.config.url}/${OrdersApi.Version}/${this.config.network}/order/maker/${params.address}/${qp}`

        return this.httpClient.get(url)
    }
}
