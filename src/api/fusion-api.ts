import {FusionApiConfig} from './types'
import {
    QuoterApi,
    QuoterRequest,
    QuoterCustomPresetRequest,
    Quote
} from './quoter'
import {RelayerApi, RelayerRequest} from './relayer'
import {
    ActiveOrdersRequest,
    ActiveOrdersResponse,
    OrdersApi,
    OrdersByMakerRequest,
    OrderStatusRequest,
    OrderStatusResponse,
    OrdersByMakerResponse
} from './orders'
import {OrdersVersion} from './ordersVersion'
import {AxiosProviderConnector} from '../connector'

export class FusionApi {
    private readonly quoterApi: QuoterApi

    private readonly relayerApi: RelayerApi

    private readonly ordersApi: OrdersApi

    constructor(config: FusionApiConfig) {
        this.quoterApi = QuoterApi.new(
            {
                url: `${config.url}/quoter`,
                network: config.network,
                authKey: config.authKey
            },
            config.httpProvider
        )

        this.relayerApi = RelayerApi.new(
            {
                url: `${config.url}/relayer`,
                network: config.network,
                authKey: config.authKey
            },
            config.httpProvider
        )

        this.ordersApi = OrdersApi.new(
            {
                url: `${config.url}/orders`,
                network: config.network,
                authKey: config.authKey
            },
            config.httpProvider
        )
    }

    static new(config: FusionApiConfig): FusionApi {
        return new FusionApi({
            network: config.network,
            url: config.url,
            authKey: config.authKey,
            httpProvider:
                config.httpProvider ||
                new AxiosProviderConnector(config.authKey)
        })
    }

    getQuote(params: QuoterRequest): Promise<Quote> {
        return this.quoterApi.getQuote(params)
    }

    getQuoteWithCustomPreset(
        params: QuoterRequest,
        body: QuoterCustomPresetRequest
    ): Promise<Quote> {
        return this.quoterApi.getQuoteWithCustomPreset(params, body)
    }

    getActiveOrders(
        params: ActiveOrdersRequest = ActiveOrdersRequest.new(),
        ordersVersion = OrdersVersion._2_1
    ): Promise<ActiveOrdersResponse> {
        return this.ordersApi.getActiveOrders(params, ordersVersion)
    }

    getOrderStatus(params: OrderStatusRequest): Promise<OrderStatusResponse> {
        return this.ordersApi.getOrderStatus(params)
    }

    getOrdersByMaker(
        params: OrdersByMakerRequest,
        ordersVersion = OrdersVersion._2_1
    ): Promise<OrdersByMakerResponse> {
        return this.ordersApi.getOrdersByMaker(params, ordersVersion)
    }

    submitOrder(params: RelayerRequest): Promise<void> {
        return this.relayerApi.submit(params)
    }

    submitOrderBatch(params: RelayerRequest[]): Promise<void> {
        return this.relayerApi.submitBatch(params)
    }
}
