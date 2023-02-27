import {FusionApi, Quote, QuoterRequest, RelayerRequest} from '../api'
import {
    FusionSDKConfigParams,
    Nonce,
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
    OrdersByMakerParams,
    OrdersByMakerRequest,
    OrdersByMakerResponse,
    OrderStatusRequest,
    OrderStatusResponse
} from '../api/orders'
import {NonceManager} from '../nonce-manager/nonce-manager'
import {OrderNonce} from '../nonce-manager/types'

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

    async getOrdersByMaker({
        limit,
        page,
        address
    }: OrdersByMakerParams): Promise<OrdersByMakerResponse> {
        const request = OrdersByMakerRequest.new({limit, page, address})

        return this.api.getOrdersByMaker(request)
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

        const nonce = await this.getNonce(params.walletAddress, params.nonce)
        const order = quote.createFusionOrder({
            receiver: params.receiver,
            preset: params.preset,
            nonce,
            permit: params.permit
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

    private async getNonce(
        walletAddress: string,
        nonce?: OrderNonce | number | string
    ): Promise<Nonce> {
        if (!this.config.blockchainProvider) {
            throw new Error('blockchainProvider has not set to config')
        }

        // in case of auto request from node
        if (nonce === OrderNonce.Auto) {
            const nonceManager = NonceManager.new({
                provider: this.config.blockchainProvider
            })

            return nonceManager.getNonce(walletAddress)
        }

        return nonce
    }
}
