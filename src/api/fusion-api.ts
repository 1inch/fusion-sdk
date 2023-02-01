import {FusionApiConfig} from './types'
import {QuoterApi, QuoterRequest} from './quoter'
import {RelayerApi, RelayerRequest} from './relayer'
import {AxiosProviderConnector} from '../connector'
import {Quote} from './quoter/quote/quote'
import {
    ActiveOrdersRequest,
    ActiveOrdersResponse,
    OrdersApi,
    OrdersByMakerRequest,
    OrderStatusRequest,
    OrderStatusResponse,
    OrdersByMakerResponse
} from './orders'

export class FusionApi {
    private readonly quoterApi: QuoterApi

    private readonly relayerApi: RelayerApi

    private readonly ordersApi: OrdersApi

    constructor(config: FusionApiConfig) {
        this.quoterApi = QuoterApi.new(
            {
                url: `${config.url}/quoter`,
                network: config.network
            },
            config.httpProvider
        )

        this.relayerApi = RelayerApi.new(
            {
                url: `${config.url}/relayer`,
                network: config.network
            },
            config.httpProvider
        )

        this.ordersApi = OrdersApi.new(
            {url: `${config.url}/orders`, network: config.network},
            config.httpProvider
        )
    }

    static new(config: FusionApiConfig): FusionApi {
        return new FusionApi({
            network: config.network,
            url: config.url,
            httpProvider: config.httpProvider || new AxiosProviderConnector()
        })
    }

    getQuote(params: QuoterRequest): Promise<Quote> {
        return this.quoterApi.getQuote(params)
    }

    getActiveOrders(
        params: ActiveOrdersRequest = ActiveOrdersRequest.new()
    ): Promise<ActiveOrdersResponse> {
        return this.ordersApi.getActiveOrders(params)
    }

    getOrderStatus(params: OrderStatusRequest): Promise<OrderStatusResponse> {
        return this.ordersApi.getOrderStatus(params)
    }

    getOrdersByMaker(
        params: OrdersByMakerRequest
    ): Promise<OrdersByMakerResponse> {
        return this.ordersApi.getOrdersByMaker(params)
    }

    submitOrder(params: RelayerRequest): Promise<void> {
        return this.relayerApi.submit(params)
    }

    submitOrderBatch(params: RelayerRequest[]): Promise<void> {
        return this.relayerApi.submitBatch(params)
    }
}
