import {Address, ProxyFactory} from '@1inch/limit-order-sdk'
import {instance, mock} from 'ts-mockito'
import {FusionSDK} from './sdk.js'
import {
    BlockchainProviderConnector,
    HttpProviderConnector,
    Web3Like,
    Web3ProviderConnector
} from '../connector/index.js'
import {NetworkEnum, ONE_INCH_LIMIT_ORDER_V4} from '../constants.js'
import {PresetEnum, QuoterResponse} from '../api/quoter/types.js'
import {Quote} from '../api/quoter/quote/quote.js'
import {QuoterRequest} from '../api/quoter/quoter.request.js'

function createHttpProviderFake<T>(mock: T): HttpProviderConnector {
    const httpProvider: HttpProviderConnector = {
        get: jest.fn().mockImplementationOnce(() => {
            return Promise.resolve(mock)
        }),
        post: jest.fn().mockImplementation(() => {
            return Promise.resolve(null)
        })
    }

    return httpProvider
}

describe(__filename, () => {
    let web3Provider: Web3Like
    let web3ProviderConnector: Web3ProviderConnector

    beforeEach(() => {
        web3Provider = mock<Web3Like>()
        web3ProviderConnector = new Web3ProviderConnector(
            instance(web3Provider)
        )
    })

    it('returns encoded call data to cancel order', async () => {
        const url = 'https://test.com'

        const expected = {
            order: {
                salt: '45144194282371711345892930501725766861375817078109214409479816083205610767025',
                maker: '0x6f250c769001617aff9bdf4b9fd878062e94af83',
                receiver: '0x0000000000000000000000000000000000000000',
                makerAsset: '0x6eb15148d0ea88433dd8088a3acc515d27e36c1b',
                takerAsset: '0xdac17f958d2ee523a2206206994597c13d831ec7',
                makingAmount: '2246481050155000',
                takingAmount: '349837736598',
                makerTraits: '0'
            },
            cancelTx: null,
            points: null,
            auctionStartDate: 1674491231,
            auctionDuration: 180,
            initialRateBump: 50484,
            status: 'filled',
            createdAt: '2023-01-23T16:26:38.803Z',
            fromTokenToUsdPrice: '0.01546652159249409068',
            toTokenToUsdPrice: '1.00135361305236370022',
            fills: [
                {
                    txHash: '0xcdd81e6860fc038d4fe8549efdf18488154667a2088d471cdaa7d492f24178a1',
                    filledMakerAmount: '2246481050155001',
                    filledAuctionTakerAmount: '351593117428'
                }
            ],
            isNativeCurrency: false
        }

        const httpProvider = createHttpProviderFake(expected)
        const sdk = new FusionSDK({
            url,
            network: NetworkEnum.ETHEREUM,
            httpProvider,
            blockchainProvider: web3ProviderConnector
        })

        const orderHash = `0x1beee023ab933cf5446c298eadadb61c05705f2156ef5b2db36c160b36f31ce4`
        const callData = await sdk.buildCancelOrderCallData(orderHash)
        expect(callData).toBe(
            '0xb68fb02000000000000000000000000000000000000000000000000000000000000000001beee023ab933cf5446c298eadadb61c05705f2156ef5b2db36c160b36f31ce4'
        )
    })

    it('throws an exception if order is not get from api', async () => {
        const url = 'https://test.com'

        const expected = undefined
        const httpProvider = createHttpProviderFake(expected)
        const sdk = new FusionSDK({
            url,
            network: NetworkEnum.ETHEREUM,
            httpProvider,
            blockchainProvider: web3ProviderConnector
        })

        const orderHash = `0x1beee023ab933cf5446c298eadadb61c05705f2156ef5b2db36c160b36f31ce4`
        const promise = sdk.buildCancelOrderCallData(orderHash)
        await expect(promise).rejects.toThrow(
            'Can not get order with the specified orderHash 0x1beee023ab933cf5446c298eadadb61c05705f2156ef5b2db36c160b36f31ce4'
        )
    })

    const DAI = '0x6b175474e89094c44da98b954eedeac495271d0f'
    const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
    const WALLET = '0x00000000219ab540356cbb839cbe05303d7705fa'

    function quotePayload(
        overrides: Partial<QuoterResponse> = {}
    ): QuoterResponse {
        const preset = {
            auctionDuration: 180,
            startAuctionIn: 12,
            bankFee: '0',
            initialRateBump: 210661,
            auctionStartAmount: '627398742236202876',
            auctionEndAmount: '614454580595911348',
            tokenFee: '0',
            points: [{delay: 24, coefficient: 50461}],
            allowPartialFills: true,
            allowMultipleFills: true,
            exclusiveResolver: null,
            gasCost: {gasBumpEstimate: 0, gasPriceEstimate: '0'}
        }

        return {
            fromTokenAmount: '1000000000000000000000',
            recommended_preset: PresetEnum.medium,
            autoK: 5.5,
            presets: {fast: preset, medium: preset, slow: preset},
            toTokenAmount: '626772029219852913',
            prices: {usd: {fromToken: '0.99', toToken: '1618'}},
            volume: {usd: {fromToken: '993', toToken: '1014'}},
            quoteId: 'quote-id-1',
            settlementAddress: '0xa88800cd213da5ae406ce248380802bd53b47647',
            whitelist: [
                '0x84d99aa569d93a9ca187d83734c8c4a519c4e9b1',
                '0xcfa62f77920d6383be12c91c71bd403599e1116f'
            ],
            fee: {
                whitelistDiscountPercent: 0,
                receiver: ONE_INCH_LIMIT_ORDER_V4,
                bps: 0
            },
            marketAmount: '626772029219852913',
            integratorFee: 0,
            integratorFeeShare: 0,
            ...overrides
        } as QuoterResponse
    }

    function blockchainFake(): BlockchainProviderConnector {
        return {
            signTypedData: jest.fn().mockResolvedValue('0xsigned'),
            ethCall: jest.fn().mockResolvedValue('0x')
        }
    }

    it('getQuote returns a Quote and defaults the wallet when omitted', async () => {
        const payload = quotePayload()
        const httpProvider = createHttpProviderFake(payload)
        const sdk = new FusionSDK({
            url: 'https://test.com',
            network: NetworkEnum.ETHEREUM,
            httpProvider
        })

        const quote = await sdk.getQuote({
            fromTokenAddress: DAI,
            toTokenAddress: WETH,
            amount: '1000000000000000000000'
        })

        expect(quote).toBeInstanceOf(Quote)
        expect(quote.quoteId).toBe('quote-id-1')
        expect(httpProvider.get).toHaveBeenCalledWith(
            expect.stringContaining('walletAddress=0x0000000000000000000000000000000000000000')
        )
    })

    it('getQuoteWithCustomPreset posts the custom auction body', async () => {
        const payload = quotePayload()
        const httpProvider = {
            get: jest.fn(),
            post: jest.fn().mockResolvedValue(payload)
        }
        const sdk = new FusionSDK({
            url: 'https://test.com',
            network: NetworkEnum.ETHEREUM,
            httpProvider
        })
        const customPreset = {
            auctionDuration: 180,
            auctionStartAmount: '627398742236202876',
            auctionEndAmount: '614454580595911348'
        }

        const quote = await sdk.getQuoteWithCustomPreset(
            {
                fromTokenAddress: DAI,
                toTokenAddress: WETH,
                amount: '1000000000000000000000',
                walletAddress: WALLET
            },
            {customPreset}
        )

        expect(quote).toBeInstanceOf(Quote)
        expect(httpProvider.post).toHaveBeenCalledWith(
            expect.stringContaining('/quoter/v2.0/1/quote/receive/'),
            expect.objectContaining({
                auctionDuration: 180,
                auctionStartAmount: '627398742236202876'
            })
        )
    })

    it('createOrder builds a prepared order from a quote with quoteId', async () => {
        const httpProvider = createHttpProviderFake(quotePayload())
        const sdk = new FusionSDK({
            url: 'https://test.com',
            network: NetworkEnum.ETHEREUM,
            httpProvider
        })

        const prepared = await sdk.createOrder({
            fromTokenAddress: DAI,
            toTokenAddress: WETH,
            amount: '1000000000000000000000',
            walletAddress: WALLET,
            receiver: '0x1111111111111111111111111111111111111111',
            preset: PresetEnum.fast,
            nonce: 5n,
            allowPartialFills: true,
            allowMultipleFills: true
        })

        expect(prepared.quoteId).toBe('quote-id-1')
        expect(prepared.hash).toMatch(/^0x[0-9a-f]{64}$/)
        expect(prepared.order.maker.toString()).toBe(WALLET)
        expect(prepared.nativeOrderFactory).toBeUndefined()
    })

    it('createOrder throws when the quoter omits quoteId', async () => {
        const httpProvider = createHttpProviderFake(
            quotePayload({quoteId: null})
        )
        const sdk = new FusionSDK({
            url: 'https://test.com',
            network: NetworkEnum.ETHEREUM,
            httpProvider
        })

        await expect(
            sdk.createOrder({
                fromTokenAddress: DAI,
                toTokenAddress: WETH,
                amount: '1000000000000000000000',
                walletAddress: WALLET
            })
        ).rejects.toThrow('quoter has not returned quoteId')
    })

    it('createOrder uses the custom-preset quoter path when a preset body is provided', async () => {
        const payload = quotePayload()
        const httpProvider = {
            get: jest.fn(),
            post: jest.fn().mockResolvedValue(payload)
        }
        const sdk = new FusionSDK({
            url: 'https://test.com',
            network: NetworkEnum.ETHEREUM,
            httpProvider
        })

        const prepared = await sdk.createOrder({
            fromTokenAddress: DAI,
            toTokenAddress: WETH,
            amount: '1000000000000000000000',
            walletAddress: WALLET,
            customPreset: {
                auctionDuration: 180,
                auctionStartAmount: '627398742236202876',
                auctionEndAmount: '614454580595911348'
            }
        })

        expect(prepared.quoteId).toBe('quote-id-1')
        expect(httpProvider.post).toHaveBeenCalled()
        expect(httpProvider.get).not.toHaveBeenCalled()
    })

    it('submitOrder signs with the blockchain provider and posts to the relayer', async () => {
        const payload = quotePayload()
        const httpProvider = {
            get: jest.fn().mockResolvedValue(payload),
            post: jest.fn().mockResolvedValue(undefined)
        }
        const blockchainProvider = blockchainFake()
        const sdk = new FusionSDK({
            url: 'https://test.com',
            network: NetworkEnum.ETHEREUM,
            httpProvider,
            blockchainProvider
        })
        const {order, quoteId, hash} = await sdk.createOrder({
            fromTokenAddress: DAI,
            toTokenAddress: WETH,
            amount: '1000000000000000000000',
            walletAddress: WALLET
        })

        const submitted = await sdk.submitOrder(order, quoteId)

        expect(blockchainProvider.signTypedData).toHaveBeenCalled()
        expect(httpProvider.post).toHaveBeenCalledWith(
            'https://test.com/relayer/v2.0/1/order/submit',
            expect.objectContaining({
                quoteId,
                signature: '0xsigned',
                extension: order.extension.encode()
            })
        )
        expect(submitted.orderHash).toBe(hash)
        expect(submitted.signature).toBe('0xsigned')
        expect(submitted.quoteId).toBe(quoteId)
    })

    it('signOrder throws when no blockchain provider is configured', async () => {
        const sdk = new FusionSDK({
            url: 'https://test.com',
            network: NetworkEnum.ETHEREUM,
            httpProvider: createHttpProviderFake(quotePayload())
        })
        const quote = new Quote(
            QuoterRequest.new({
                fromTokenAddress: DAI,
                toTokenAddress: WETH,
                amount: '1000000000000000000000',
                walletAddress: WALLET
            }),
            quotePayload()
        )
        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM
        })

        await expect(sdk.signOrder(order)).rejects.toThrow(
            'blockchainProvider has not set to config'
        )
    })

    it('placeOrder creates then submits the order', async () => {
        const payload = quotePayload()
        const httpProvider = {
            get: jest.fn().mockResolvedValue(payload),
            post: jest.fn().mockResolvedValue(undefined)
        }
        const sdk = new FusionSDK({
            url: 'https://test.com',
            network: NetworkEnum.ETHEREUM,
            httpProvider,
            blockchainProvider: blockchainFake()
        })

        const placed = await sdk.placeOrder({
            fromTokenAddress: DAI,
            toTokenAddress: WETH,
            amount: '1000000000000000000000',
            walletAddress: WALLET
        })

        expect(placed.quoteId).toBe('quote-id-1')
        expect(placed.signature).toBe('0xsigned')
        expect(placed.orderHash).toMatch(/^0x[0-9a-f]{64}$/)
    })

    it('submitNativeOrder uses the on-chain native signature', async () => {
        const nativeFactory = '0x62c650084e97a0fba2ecf365cc6d8a7722425363'
        const nativeImpl = '0xe8773a43fce4eedb18d0edbaf319059e1ae786af'
        const payload = quotePayload({
            nativeOrderFactoryAddress: nativeFactory,
            nativeOrderImplAddress: nativeImpl
        })
        const httpProvider = {
            get: jest.fn().mockResolvedValue(payload),
            post: jest.fn().mockResolvedValue(undefined)
        }
        const sdk = new FusionSDK({
            url: 'https://test.com',
            network: NetworkEnum.ETHEREUM,
            httpProvider
        })
        const quote = new Quote(
            QuoterRequest.new({
                fromTokenAddress: Address.NATIVE_CURRENCY.toString(),
                toTokenAddress: DAI,
                amount: '1000000000000000000000',
                walletAddress: WALLET
            }),
            payload
        )
        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM
        })
        const maker = new Address(WALLET)
        const expectedSig = sdk.signNativeOrder(order, maker)

        const submitted = await sdk.submitNativeOrder(order, maker, 'quote-id-1')

        expect(submitted.signature).toBe(expectedSig)
        expect(httpProvider.post).toHaveBeenCalledWith(
            'https://test.com/relayer/v2.0/1/order/submit',
            expect.objectContaining({
                quoteId: 'quote-id-1',
                signature: expectedSig
            })
        )
        expect(
            order.isNative(
                NetworkEnum.ETHEREUM,
                new ProxyFactory(new Address(nativeFactory), new Address(nativeImpl)),
                expectedSig
            )
        ).toBe(true)
    })
})

