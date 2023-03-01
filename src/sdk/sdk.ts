import {
    FusionApi,
    GasPriceApi,
    Quote,
    QuoterRequest,
    RelayerRequest
} from '../api'
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
import {TransactionParams} from '../connector'
import {encodeCancelOrder} from '../settlement/encoders/cancel-order.encoder'

export class FusionSDK {
    public readonly api: FusionApi

    private readonly gasPriceApi: GasPriceApi

    constructor(private readonly config: FusionSDKConfigParams) {
        this.api = FusionApi.new({
            url: config.url,
            network: config.network,
            httpProvider: config.httpProvider
        })

        this.gasPriceApi = GasPriceApi.new({
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

    async cancelOrder(
        params: Required<TransactionParams>,
        orderHash: string
    ): Promise<string | undefined> {
        if (params.gasPriceMultiplier === 1) {
            throw new Error('cannot cancel transaction with the same gas price')
        }

        if (!params.nonce) {
            throw new Error(
                'you should set previous nonce for transaction cancellation'
            )
        }

        const getOrderRequest = OrderStatusRequest.new({orderHash})
        const order = await this.api.getOrderStatus(getOrderRequest)
        const cancelOrderEncodedData = encodeCancelOrder({
            makerAsset: order.order.makerAsset,
            takerAsset: order.order.takerAsset,
            maker: order.order.maker,
            receiver: order.order.receiver,
            allowedSender: order.order.allowedSender,
            interactions: order.order.interactions,
            makingAmount: order.order.makingAmount,
            takingAmount: order.order.takingAmount,
            salt: order.order.salt,
            offsets: order.order.offsets
        })

        const txParams: Required<TransactionParams> = {
            ...params,
            data: !params.data ? cancelOrderEncodedData : params.data,
            gasPrice: !params.gasPrice
                ? await this.gasPriceApi.getGasPrice()
                : params.gasPrice
        }

        const signedTx = await this.config.blockchainProvider?.signTransaction(
            txParams
        )

        if (!signedTx) {
            throw new Error(`could not sign the transaction`)
        }

        return this.config.blockchainProvider?.sendTransaction(signedTx)
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
