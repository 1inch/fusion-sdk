import {FusionApi, QuoterRequest, RelayerRequest, Quote} from '../api'
import {
    FusionSDKConfigParams,
    OrderInfo,
    OrderParams,
    QuoteParams
} from './types'
import {ZERO_ADDRESS} from '../constants'
import {getLimitOrderV3Domain} from '../limit-order'
import {
    ActiveOrdersRequest,
    ActiveOrdersRequestParams,
    ActiveOrdersResponse,
    OrderStatusRequest,
    OrderStatusResponse
} from '../api/orders'

export class FusionSDK {
    public readonly api: FusionApi

    constructor(private readonly config: FusionSDKConfigParams) {
        this.api = FusionApi.new({
            url: config.url,
            network: config.network,
            httpProvider: config.httpProvider
        })
    }

    async getActiveOrders({
        page,
        limit
    }: ActiveOrdersRequestParams = {}): Promise<ActiveOrdersResponse> {
        const request = ActiveOrdersRequest.new({page, limit})

        return this.api.getActiveOrders(request)
    }

    async getOrderStatus(orderHash: string): Promise<OrderStatusResponse> {
        const request = OrderStatusRequest.new({orderHash})

        return this.api.getOrderStatus(request)
    }

    async getQuote(params: QuoteParams): Promise<Quote> {
        const request = QuoterRequest.new({
            fromTokenAddress: params.fromTokenAddress,
            toTokenAddress: params.toTokenAddress,
            amount: params.amount,
            walletAddress: ZERO_ADDRESS,
            permit: params.permit,
            enableEstimate: false
        })

        return this.api.getQuote(request)
    }

    async placeOrder(params: OrderParams): Promise<OrderInfo> {
        if (!this.config.blockchainProvider) {
            throw new Error('blockchainProvider has not set to config')
        }

        const quoterRequest = QuoterRequest.new({
            fromTokenAddress: params.fromTokenAddress,
            toTokenAddress: params.toTokenAddress,
            amount: params.amount,
            walletAddress: params.walletAddress,
            permit: params.permit,
            enableEstimate: true
        })

        const quote = await this.api.getQuote(quoterRequest)

        if (!quote.quoteId) {
            throw new Error('quoter has not returned quoteId')
        }

        const order = quote.createFusionOrder({
            receiver: params.receiver,
            preset: params.preset
        })

        const domain = getLimitOrderV3Domain(this.config.network)

        const signature = await this.config.blockchainProvider.signTypedData(
            params.walletAddress,
            order.getTypedData(domain)
        )

        const orderStruct = order.build()

        const relayerRequest = RelayerRequest.new({
            order: orderStruct,
            signature,
            quoteId: quote.quoteId
        })

        await this.api.submitOrder(relayerRequest)

        return {
            order: order.build(),
            signature,
            quoteId: quote.quoteId,
            orderHash: order.getOrderHash(domain)
        }
    }
}
