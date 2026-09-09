import {FusionApi} from './fusion-api.js'
import {QuoterRequest} from './quoter/quoter.request.js'
import {QuoterCustomPresetRequest} from './quoter/quoter-custom-preset.request.js'
import {RelayerRequest} from './relayer/relayer.request.js'
import {
    ActiveOrdersRequest,
    OrdersByMakerRequest,
    OrderStatusRequest
} from './orders/orders.request.js'
import {NetworkEnum} from '../constants.js'
import {HttpProviderConnector} from '../connector/index.js'
import {PresetEnum, QuoterResponse} from './quoter/types.js'
import {ONE_INCH_LIMIT_ORDER_V4} from '../constants.js'

const quoteBody = {
    fromTokenAmount: '1000000000000000000',
    recommended_preset: PresetEnum.fast,
    autoK: 1,
    presets: {
        fast: {
            auctionDuration: 180,
            startAuctionIn: 12,
            bankFee: '0',
            initialRateBump: 100,
            auctionStartAmount: '1100',
            auctionEndAmount: '1000',
            tokenFee: '0',
            points: [],
            allowPartialFills: true,
            allowMultipleFills: true,
            exclusiveResolver: null,
            gasCost: {gasBumpEstimate: 0, gasPriceEstimate: '0'}
        },
        medium: {
            auctionDuration: 180,
            startAuctionIn: 12,
            bankFee: '0',
            initialRateBump: 100,
            auctionStartAmount: '1100',
            auctionEndAmount: '1000',
            tokenFee: '0',
            points: [],
            allowPartialFills: true,
            allowMultipleFills: true,
            exclusiveResolver: null,
            gasCost: {gasBumpEstimate: 0, gasPriceEstimate: '0'}
        },
        slow: {
            auctionDuration: 180,
            startAuctionIn: 12,
            bankFee: '0',
            initialRateBump: 100,
            auctionStartAmount: '1100',
            auctionEndAmount: '1000',
            tokenFee: '0',
            points: [],
            allowPartialFills: true,
            allowMultipleFills: true,
            exclusiveResolver: null,
            gasCost: {gasBumpEstimate: 0, gasPriceEstimate: '0'}
        }
    },
    toTokenAmount: '1000',
    prices: {usd: {fromToken: '1', toToken: '1'}},
    volume: {usd: {fromToken: '1', toToken: '1'}},
    quoteId: 'qid',
    settlementAddress: '0xa88800cd213da5ae406ce248380802bd53b47647',
    whitelist: ['0x84d99aa569d93a9ca187d83734c8c4a519c4e9b1'],
    fee: {
        whitelistDiscountPercent: 0,
        receiver: ONE_INCH_LIMIT_ORDER_V4,
        bps: 0
    },
    marketAmount: '1000',
    integratorFee: 0,
    integratorFeeShare: 0
} as QuoterResponse

function httpFake(): HttpProviderConnector {
    return {
        get: jest.fn().mockResolvedValue(quoteBody),
        post: jest.fn().mockResolvedValue(quoteBody)
    }
}

describe('FusionApi', () => {
    const quoterParams = QuoterRequest.new({
        fromTokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
        toTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        amount: '1000000000000000000',
        walletAddress: '0x00000000219ab540356cbb839cbe05303d7705fa'
    })

    it('delegates quote, orders and relayer calls through the provided http client', async () => {
        const httpProvider = httpFake()
        const api = FusionApi.new({
            url: 'https://test.com',
            network: NetworkEnum.ETHEREUM,
            httpProvider
        })

        await api.getQuote(quoterParams)
        expect(httpProvider.get).toHaveBeenCalledWith(
            expect.stringContaining(
                'https://test.com/quoter/v2.0/1/quote/receive/'
            )
        )

        const custom = QuoterCustomPresetRequest.new({
            customPreset: {
                auctionDuration: 180,
                auctionStartAmount: '1100',
                auctionEndAmount: '1000'
            }
        })
        await api.getQuoteWithCustomPreset(quoterParams, custom)
        expect(httpProvider.post).toHaveBeenCalledWith(
            expect.stringContaining(
                'https://test.com/quoter/v2.0/1/quote/receive/'
            ),
            custom.build()
        )

        await api.getActiveOrders(ActiveOrdersRequest.new({page: 1, limit: 2}))
        expect(httpProvider.get).toHaveBeenCalledWith(
            expect.stringContaining(
                'https://test.com/orders/v2.0/1/order/active/'
            )
        )

        const hash =
            '0x1beee023ab933cf5446c298eadadb61c05705f2156ef5b2db36c160b36f31ce4'
        await api.getOrderStatus(OrderStatusRequest.new({orderHash: hash}))
        expect(httpProvider.get).toHaveBeenCalledWith(
            `https://test.com/orders/v2.0/1/order/status/${hash}`
        )

        const maker = '0xfa80cd9b3becc0b4403b0f421384724f2810775f'
        await api.getOrdersByMaker(
            OrdersByMakerRequest.new({address: maker, page: 1, limit: 1})
        )
        expect(httpProvider.get).toHaveBeenCalledWith(
            expect.stringContaining(
                `https://test.com/orders/v2.0/1/order/maker/${maker}/`
            )
        )

        const relayer = RelayerRequest.new({
            order: {
                maker: '0x00000000219ab540356cbb839cbe05303d7705fa',
                makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                makingAmount: '1',
                receiver: '0x0000000000000000000000000000000000000000',
                salt: '1',
                takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                takingAmount: '1',
                makerTraits: '0'
            },
            signature: '0xab',
            quoteId: 'qid',
            extension: '0x'
        })
        await api.submitOrder(relayer)
        expect(httpProvider.post).toHaveBeenCalledWith(
            'https://test.com/relayer/v2.0/1/order/submit',
            relayer
        )

        await api.submitOrderBatch([relayer])
        expect(httpProvider.post).toHaveBeenCalledWith(
            'https://test.com/relayer/v2.0/1/order/submit/many',
            [relayer]
        )
    })

    it('falls back to AxiosProviderConnector when no http provider is passed', () => {
        const api = FusionApi.new({
            url: 'https://test.com',
            network: NetworkEnum.ETHEREUM,
            authKey: 'key'
        })

        expect(api).toBeInstanceOf(FusionApi)
    })
})
