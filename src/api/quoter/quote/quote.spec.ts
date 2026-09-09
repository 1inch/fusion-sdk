import {Address, Bps, ProxyFactory} from '@1inch/limit-order-sdk'
import {Quote} from './quote.js'
import {FusionOrderParams} from './order-params.js'
import {QuoterRequest} from '../quoter.request.js'
import {PresetEnum, QuoterResponse} from '../types.js'
import {NetworkEnum, ONE_INCH_LIMIT_ORDER_V4} from '../../../constants.js'
import {CHAIN_TO_WRAPPER} from '../../../fusion-order/constants.js'
import {Preset} from '../preset.js'

const DAI = '0x6b175474e89094c44da98b954eedeac495271d0f'
const WETH = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
const WALLET = '0x00000000219ab540356cbb839cbe05303d7705fa'
const RESOLVER_A = '0x84d99aa569d93a9ca187d83734c8c4a519c4e9b1'
const RESOLVER_B = '0xcfa62f77920d6383be12c91c71bd403599e1116f'
const SETTLEMENT = '0xa88800cd213da5ae406ce248380802bd53b47647'
const NATIVE_FACTORY = '0x62c650084e97a0fba2ecf365cc6d8a7722425363'
const NATIVE_IMPL = '0xe8773a43fce4eedb18d0edbaf319059e1ae786af'

function presetData(overrides: Partial<QuoterResponse['presets']['fast']> = {}) {
    return {
        auctionDuration: 180,
        startAuctionIn: 12,
        bankFee: '0',
        initialRateBump: 210661,
        auctionStartAmount: '627398742236202876',
        auctionEndAmount: '614454580595911348',
        tokenFee: '9183588477842300',
        points: [{delay: 24, coefficient: 50461}],
        allowPartialFills: true,
        allowMultipleFills: true,
        exclusiveResolver: null,
        gasCost: {
            gasBumpEstimate: 0,
            gasPriceEstimate: '0'
        },
        ...overrides
    }
}

function quoteResponse(overrides: Partial<QuoterResponse> = {}): QuoterResponse {
    return {
        fromTokenAmount: '1000000000000000000000',
        recommended_preset: PresetEnum.medium,
        autoK: 5.5,
        presets: {
            fast: presetData({startAuctionIn: 36, initialRateBump: 200461}),
            medium: presetData(),
            slow: presetData({
                auctionDuration: 600,
                initialRateBump: 302466
            })
        },
        toTokenAmount: '626772029219852913',
        prices: {
            usd: {fromToken: '0.99', toToken: '1618.25'}
        },
        volume: {
            usd: {fromToken: '993.26', toToken: '1014.27'}
        },
        quoteId: 'quote-1',
        settlementAddress: SETTLEMENT,
        whitelist: [RESOLVER_A, RESOLVER_B],
        fee: {
            whitelistDiscountPercent: 1,
            receiver: ONE_INCH_LIMIT_ORDER_V4,
            bps: 10
        },
        marketAmount: '626772029219852913',
        integratorFee: 0,
        integratorFeeShare: 0,
        ...overrides
    } as QuoterResponse
}

function request(
    overrides: Partial<ConstructorParameters<typeof QuoterRequest>[0]> = {}
): QuoterRequest {
    return QuoterRequest.new({
        fromTokenAddress: DAI,
        toTokenAddress: WETH,
        amount: '1000000000000000000000',
        walletAddress: WALLET,
        ...overrides
    })
}

describe('Quote', () => {
    it('getPreset returns recommended preset by name and defaults to fast', () => {
        const quote = new Quote(request(), quoteResponse())

        expect(quote.getPreset(PresetEnum.medium)).toBeInstanceOf(Preset)
        expect(quote.getPreset(PresetEnum.medium).auctionDuration).toBe(180n)
        expect(quote.getPreset().auctionDuration).toBe(180n)
        expect(quote.getPreset(PresetEnum.slow).auctionDuration).toBe(600n)
        expect(quote.recommendedPreset).toBe(PresetEnum.medium)
    })

    it('builds a fusion order from the recommended preset', () => {
        const quote = new Quote(request(), quoteResponse())
        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM
        })

        const built = order.build()
        expect(built.maker).toBe(WALLET)
        expect(built.makerAsset).toBe(DAI)
        expect(built.takerAsset).toBe(WETH)
        expect(built.makingAmount).toBe('1000000000000000000000')
        expect(built.takingAmount).toBe('614454580595911348')
        expect(order.partialFillAllowed).toBe(true)
        expect(order.multipleFillsAllowed).toBe(true)
        expect(order.settlementExtensionContract.toString()).toBe(SETTLEMENT)
    })

    it('honours preset, receiver, nonce, delay and expiration', () => {
        const receiver = new Address(
            '0x1111111111111111111111111111111111111111'
        )
        const quote = new Quote(request(), quoteResponse())
        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM,
            preset: PresetEnum.slow,
            receiver,
            nonce: 42n,
            delayAuctionStartTimeBy: 30n,
            orderExpirationDelay: 20n
        })

        expect(order.nonce).toBe(42n)
        expect(order.takingAmount).toBe(614454580595911348n)
        expect(order.auctionEndTime - order.auctionStartTime).toBe(600n)
        expect(order.deadline - order.auctionEndTime).toBe(20n)
        expect(order.realReceiver.equal(receiver)).toBe(true)
    })

    it('requires a nonce when partial or multiple fills are disabled', () => {
        const quote = new Quote(request(), quoteResponse())
        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM,
            allowPartialFills: false,
            allowMultipleFills: true,
            nonce: 7n
        })

        expect(order.partialFillAllowed).toBe(false)
        expect(order.nonce).toBe(7n)
        expect(order.isBitInvalidatorMode).toBe(true)
    })

    it('generates a nonce when fills are restricted and none is provided', () => {
        const quote = new Quote(request(), quoteResponse())
        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM,
            allowPartialFills: true,
            allowMultipleFills: false
        })

        expect(order.multipleFillsAllowed).toBe(false)
        expect(order.nonce).toBeGreaterThanOrEqual(0n)
    })

    it('puts the exclusive resolver first in the whitelist window', () => {
        const quote = new Quote(
            request(),
            quoteResponse({
                presets: {
                    fast: presetData(),
                    medium: presetData({exclusiveResolver: RESOLVER_A}),
                    slow: presetData()
                }
            })
        )
        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM,
            preset: PresetEnum.medium
        })

        expect(order.isExclusiveResolver(new Address(RESOLVER_A))).toBe(true)
        expect(order.isExclusiveResolver(new Address(RESOLVER_B))).toBe(false)
        expect(
            order.canExecuteAt(new Address(RESOLVER_A), order.auctionStartTime)
        ).toBe(true)
    })

    it('attaches surplus when market return is above the auction end amount', () => {
        const quote = new Quote(
            request(),
            quoteResponse({surplusFee: 50})
        )
        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM
        })

        expect(
            order.getSurplusFee(
                new Address(RESOLVER_A),
                order.makingAmount,
                order.auctionEndTime
            )
        ).toBeGreaterThanOrEqual(0n)
    })

    it('skips surplus when market return does not exceed taking amount', () => {
        const quote = new Quote(
            request(),
            quoteResponse({
                marketAmount: '100',
                surplusFee: 50
            })
        )
        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM
        })

        expect(
            order.getSurplusFee(
                new Address(RESOLVER_A),
                order.makingAmount,
                order.auctionEndTime
            )
        ).toBe(0n)
    })

    it('builds fees from protocol bps and integrator response', () => {
        const quote = new Quote(
            request(),
            quoteResponse({
                integratorFee: 100,
                integratorFeeReceiver:
                    '0x1234567890123456789012345678901234567890',
                integratorFeeShare: 50
            })
        )
        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM
        })

        expect(order.receiver.toString()).toBe(SETTLEMENT)
        expect(
            order.getIntegratorFee(
                new Address(RESOLVER_A),
                order.auctionStartTime
            )
        ).toBeGreaterThan(0n)
        expect(
            order.getResolverFee(
                new Address(RESOLVER_A),
                order.auctionStartTime
            )
        ).toBeGreaterThan(0n)
        expect(
            order.getProtocolShareOfIntegratorFee(
                new Address(RESOLVER_A),
                order.auctionStartTime
            )
        ).toBeGreaterThan(0n)
        expect(
            order.getProtocolFee(
                new Address(RESOLVER_A),
                order.auctionStartTime
            )
        ).toBeGreaterThan(0n)
    })

    it('omits fees when protocol bps and integrator fee are zero', () => {
        const quote = new Quote(
            request(),
            quoteResponse({
                fee: {
                    whitelistDiscountPercent: 0,
                    receiver: ONE_INCH_LIMIT_ORDER_V4,
                    bps: 0
                }
            })
        )
        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM
        })

        expect(order.receiver.toString()).toBe(
            '0x0000000000000000000000000000000000000000'
        )
        expect(
            order.getResolverFee(
                new Address(RESOLVER_A),
                order.auctionStartTime
            )
        ).toBe(0n)
    })

    it('wraps native to-token and enables unwrap', () => {
        const quote = new Quote(
            request({toTokenAddress: Address.NATIVE_CURRENCY.toString()}),
            quoteResponse()
        )
        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM
        })

        expect(order.takerAsset.toString()).toBe(
            CHAIN_TO_WRAPPER[NetworkEnum.ETHEREUM].toString()
        )
        expect(order.build().takerAsset).toBe(
            CHAIN_TO_WRAPPER[NetworkEnum.ETHEREUM].toString()
        )
    })

    it('creates a native-from order when the factory addresses are present', () => {
        const quote = new Quote(
            request({fromTokenAddress: Address.NATIVE_CURRENCY.toString()}),
            quoteResponse({
                nativeOrderFactoryAddress: NATIVE_FACTORY,
                nativeOrderImplAddress: NATIVE_IMPL
            })
        )

        expect(quote.nativeOrderFactory).toBeInstanceOf(ProxyFactory)
        expect(quote.nativeOrderFactory?.factory.toString()).toBe(NATIVE_FACTORY)

        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM
        })
        const maker = new Address(WALLET)

        expect(
            order.isNative(
                NetworkEnum.ETHEREUM,
                quote.nativeOrderFactory as ProxyFactory,
                order.nativeSignature(maker)
            )
        ).toBe(true)
    })

    it('throws when quoting a native-from order without a factory', () => {
        const quote = new Quote(
            request({fromTokenAddress: Address.NATIVE_CURRENCY.toString()}),
            quoteResponse()
        )

        expect(() =>
            quote.createFusionOrder({network: NetworkEnum.ETHEREUM})
        ).toThrow(/expected nativeOrderFactory/)
    })

    it('forwards permit and permit2 from the quote request', () => {
        const permit =
            '0x0000000000000000000000000000000000000000000000000000000000000001'
        const quote = new Quote(
            request({permit, isPermit2: true}),
            quoteResponse({
                fee: {
                    whitelistDiscountPercent: 0,
                    receiver: ONE_INCH_LIMIT_ORDER_V4,
                    bps: 0
                }
            })
        )
        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM
        })

        expect(order.extension.makerPermit).not.toBe('0x')
        expect(order.build().makerTraits).toBeDefined()
    })

    it('uses a custom preset when the quoter returned one', () => {
        const quote = new Quote(
            request(),
            quoteResponse({
                presets: {
                    fast: presetData(),
                    medium: presetData(),
                    slow: presetData(),
                    custom: presetData({
                        auctionDuration: 90,
                        auctionEndAmount: '500000000000000000'
                    })
                }
            })
        )

        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM,
            preset: PresetEnum.custom
        })

        expect(quote.getPreset(PresetEnum.custom)?.auctionDuration).toBe(90n)
        expect(order.takingAmount).toBe(500000000000000000n)
        expect(order.auctionEndTime - order.auctionStartTime).toBe(90n)
    })

    it('prefers response source over the request source when building the order', () => {
        const quote = new Quote(
            request({source: 'sdk-source'}),
            quoteResponse({source: '0xabcdef01'})
        )
        const order = quote.createFusionOrder({
            network: NetworkEnum.ETHEREUM
        })

        expect(quote.source).toBe('0xabcdef01')
        expect(order.salt).toBeGreaterThan(0n)
    })
})

describe('FusionOrderParams', () => {
    it('applies defaults and optional overrides', () => {
        const defaults = FusionOrderParams.new({
            network: NetworkEnum.ETHEREUM
        })
        expect(defaults.preset).toBe(PresetEnum.fast)
        expect(defaults.receiver.equal(Address.ZERO_ADDRESS)).toBe(true)
        expect(defaults.delayAuctionStartTimeBy).toBe(0n)
        expect(defaults.permit).toBeUndefined()
        expect(defaults.nonce).toBeUndefined()

        const receiver = Address.fromBigInt(9n)
        const overridden = FusionOrderParams.new({
            network: NetworkEnum.POLYGON,
            preset: PresetEnum.slow,
            receiver,
            permit: '0xab',
            isPermit2: true,
            nonce: 3n,
            delayAuctionStartTimeBy: 15n
        })
        expect(overridden.preset).toBe(PresetEnum.slow)
        expect(overridden.receiver.equal(receiver)).toBe(true)
        expect(overridden.permit).toBe('0xab')
        expect(overridden.isPermit2).toBe(true)
        expect(overridden.nonce).toBe(3n)
        expect(overridden.delayAuctionStartTimeBy).toBe(15n)
    })
})
