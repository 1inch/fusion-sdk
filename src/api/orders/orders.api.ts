import {AxiosProviderConnector, HttpProviderConnector} from '../../connector'
import {concatQueryParams} from '../params'
import {ActiveOrdersRequest, OrderStatusRequest} from './orders.request'
import {
    ActiveOrdersResponse,
    OrdersApiConfig,
    OrderStatusResponse
} from './types'

export class OrdersApi {
    constructor(
        private readonly config: OrdersApiConfig,
        private readonly httpClient: HttpProviderConnector
    ) {}

    static new(
        config: OrdersApiConfig,
        httpClient = new AxiosProviderConnector()
    ): OrdersApi {
        return new OrdersApi(config, httpClient)
    }

    async getActiveOrders(
        params: ActiveOrdersRequest
    ): Promise<ActiveOrdersResponse> {
        const queryParams = concatQueryParams(params.build())
        const url = `${this.config.url}/v1.0/${this.config.network}/order/active/${queryParams}`

        return this.httpClient.get<ActiveOrdersResponse>(url)
    }

    async getOrderStatus(
        params: OrderStatusRequest
    ): Promise<OrderStatusResponse> {
        const url = `${this.config.url}/v1.0/${this.config.network}/order/status/${params.orderHash}`

        return this.httpClient.get<OrderStatusResponse>(url)
    }
}
