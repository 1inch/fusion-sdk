import {AxiosProviderConnector, HttpProviderConnector} from '../../connector'
import {concatQueryParams} from '../params'
import {ActiveOrdersRequest} from './orders.request'
import {ActiveOrdersResponse, OrdersApiConfig} from './types'

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
        request: ActiveOrdersRequest
    ): Promise<ActiveOrdersResponse> {
        const queryParams = concatQueryParams(request.build())
        const url = `${this.config.url}/v1.0/${this.config.network}/order/active/${queryParams}`

        return this.httpClient.get<ActiveOrdersResponse>(url)
    }
}
