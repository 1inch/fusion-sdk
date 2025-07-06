import {Address, MakerTraits} from '@1inch/limit-order-sdk'
import {
    FusionSDKConfigParams,
    OrderInfo,
    OrderParams,
    PreparedOrder,
    QuoteParams,
    QuoteCustomPresetParams
} from './types.js'
import {encodeCancelOrder} from './encoders/index.js'
import {
    FusionApi,
    Quote,
    QuoterRequest,
    RelayerRequest,
    QuoterCustomPresetRequest
} from '../api/index.js'
import {
    ActiveOrdersRequest,
    ActiveOrdersRequestParams,
    ActiveOrdersResponse,
    OrdersByMakerParams,
    OrdersByMakerRequest,
    OrdersByMakerResponse,
    OrderStatusRequest,
    OrderStatusResponse
} from '../api/orders/index.js'
import {FusionOrder} from '../fusion-order/index.js'

export class FusionSDK {
    public readonly api: FusionApi

    constructor(private readonly config: FusionSDKConfigParams) {
        this.api = FusionApi.new({
            url: config.url,
            network: config.network,
            httpProvider: config.httpProvider,
            authKey: config.authKey
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
            walletAddress:
                params.walletAddress || Address.ZERO_ADDRESS.toString(),
            permit: params.permit,
            enableEstimate: !!params.enableEstimate,
            source: params.source,
            isPermit2: params.isPermit2,
            integratorFee: params.integratorFee
        })

        return this.api.getQuote(request)
    }

    async getQuoteWithCustomPreset(
        params: QuoteParams,
        body: QuoteCustomPresetParams
    ): Promise<Quote> {
        const paramsRequest = QuoterRequest.new({
            fromTokenAddress: params.fromTokenAddress,
            toTokenAddress: params.toTokenAddress,
            amount: params.amount,
            walletAddress:
                params.walletAddress || Address.ZERO_ADDRESS.toString(),
            permit: params.permit,
            enableEstimate: !!params.enableEstimate,
            integratorFee: params?.integratorFee,
            source: params.source,
            isPermit2: params.isPermit2
        })

        const bodyRequest = QuoterCustomPresetRequest.new({
            customPreset: body.customPreset
        })

        return this.api.getQuoteWithCustomPreset(paramsRequest, bodyRequest)
    }

    async createOrder(params: OrderParams): Promise<PreparedOrder> {
        const quote = await this.getQuoteResult(params)

        if (!quote.quoteId) {
            throw new Error('quoter has not returned quoteId')
        }

        const order = quote.createFusionOrder({
            receiver: params.receiver
                ? new Address(params.receiver)
                : undefined,
            preset: params.preset,
            nonce: params.nonce,
            allowPartialFills: params.allowPartialFills,
            allowMultipleFills: params.allowMultipleFills,
            orderExpirationDelay: params.orderExpirationDelay,
            network: this.config.network
        })

        const hash = order.getOrderHash(this.config.network)

        return {order, hash, quoteId: quote.quoteId}
    }

    public async submitOrder(
        order: FusionOrder,
        quoteId: string
    ): Promise<OrderInfo> {
        if (!this.config.blockchainProvider) {
            throw new Error('blockchainProvider has not set to config')
        }

        const orderStruct = order.build()

        const signature = await this.config.blockchainProvider.signTypedData(
            orderStruct.maker,
            order.getTypedData(this.config.network)
        )

        const relayerRequest = RelayerRequest.new({
            order: orderStruct,
            signature,
            quoteId,
            extension: order.extension.encode()
        })

        await this.api.submitOrder(relayerRequest)

        return {
            order: orderStruct,
            signature,
            quoteId,
            orderHash: order.getOrderHash(this.config.network),
            extension: relayerRequest.extension
        }
    }

    async placeOrder(params: OrderParams): Promise<OrderInfo> {
        const {order, quoteId} = await this.createOrder(params)

        return this.submitOrder(order, quoteId)
    }

    async buildCancelOrderCallData(orderHash: string): Promise<string> {
        const getOrderRequest = OrderStatusRequest.new({orderHash})
        const orderData = await this.api.getOrderStatus(getOrderRequest)

        if (!orderData) {
            throw new Error(
                `Can not get order with the specified orderHash ${orderHash}`
            )
        }

        const {order} = orderData

        return encodeCancelOrder(
            orderHash,
            new MakerTraits(BigInt(order.makerTraits))
        )
    }

    async signOrder(order: FusionOrder): Promise<string> {
        if (!this.config.blockchainProvider) {
            throw new Error('blockchainProvider has not set to config')
        }

        const orderStruct = order.build()
        const data = order.getTypedData(this.config.network)

        return this.config.blockchainProvider.signTypedData(
            orderStruct.maker,
            data
        )
    }

    private async getQuoteResult(params: OrderParams): Promise<Quote> {
        const quoterRequest = QuoterRequest.new({
            fromTokenAddress: params.fromTokenAddress,
            toTokenAddress: params.toTokenAddress,
            amount: params.amount,
            walletAddress: params.walletAddress,
            permit: params.permit,
            enableEstimate: true,
            source: params.source,
            isPermit2: params.isPermit2,
            integratorFee: params?.integratorFee
        })

        if (!params.customPreset) {
            return this.api.getQuote(quoterRequest)
        }

        const quoterWithCustomPresetBodyRequest = QuoterCustomPresetRequest.new(
            {
                customPreset: params.customPreset
            }
        )

        return this.api.getQuoteWithCustomPreset(
            quoterRequest,
            quoterWithCustomPresetBodyRequest
        )
    }
}
