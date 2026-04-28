import {
    Address,
    Bps,
    MakerTraits,
    Extension,
    Interaction,
    ProxyFactory
} from '@1inch/limit-order-sdk'
import {parseEther, parseUnits} from 'ethers'
import {FusionOrder} from './fusion-order.js'
import {AuctionDetails} from './auction-details/index.js'
import {Whitelist} from './whitelist/index.js'
import {SurplusParams} from './surplus-params.js'
import {Fees, IntegratorFee, ResolverFee} from './fees/index.js'
import {NetworkEnum} from '../constants.js'
import {AuctionCalculator} from '../amount-calculator/index.js'
import {now} from '../utils/time.js'

describe('Fusion Order', () => {
    it('should create fusion order', () => {
        const extensionContract = new Address(
            '0x8273f37417da37c4a6c3995e82cf442f87a25d9c'
        )

        const order = FusionOrder.new(
            extensionContract,
            {
                makerAsset: new Address(
                    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
                ),
                takerAsset: new Address(
                    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
                ),
                makingAmount: 1000000000000000000n,
                takingAmount: 1420000000n,
                maker: new Address(
                    '0x00000000219ab540356cbb839cbe05303d7705fa'
                ),
                salt: 10n
            },
            {
                auction: new AuctionDetails({
                    duration: 180n,
                    startTime: 1673548149n,
                    initialRateBump: 50000,
                    points: [
                        {
                            coefficient: 20000,
                            delay: 12
                        }
                    ]
                }),
                whitelist: Whitelist.new(1673548139n, [
                    {
                        address: new Address(
                            '0x00000000219ab540356cbb839cbe05303d7705fa'
                        ),
                        allowFrom: 0n
                    }
                ]),
                surplus: SurplusParams.NO_FEE
            }
        )

        const builtOrder = order.build()
        expect(builtOrder).toStrictEqual({
            maker: '0x00000000219ab540356cbb839cbe05303d7705fa',
            makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            makingAmount: '1000000000000000000',
            receiver: '0x0000000000000000000000000000000000000000', // as there is no fee
            takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            takingAmount: '1420000000',
            makerTraits:
                '33471150795161712739625987854073848363835856965607525350783622537007396290560',
            salt: '14806972048616591160256394064723634084331321369214'
        })

        const makerTraits = new MakerTraits(BigInt(builtOrder.makerTraits))
        expect(makerTraits.isNativeUnwrapEnabled()).toEqual(false)
        expect(makerTraits.nonceOrEpoch()).toEqual(0n)
        expect(makerTraits.isPartialFillAllowed()).toEqual(true)
    })
    it('should create fusion order with fees', () => {
        const extensionContract = new Address(
            '0x8273f37417da37c4a6c3995e82cf442f87a25d9c'
        )

        const order = FusionOrder.new(
            extensionContract,
            {
                makerAsset: new Address(
                    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
                ),
                takerAsset: new Address(
                    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
                ),
                makingAmount: 1000000000000000000n,
                takingAmount: 1420000000n,
                maker: new Address(
                    '0x00000000219ab540356cbb839cbe05303d7705fa'
                ),
                salt: 10n
            },
            {
                auction: new AuctionDetails({
                    duration: 180n,
                    startTime: 1673548149n,
                    initialRateBump: 50000,
                    points: [
                        {
                            coefficient: 20000,
                            delay: 12
                        }
                    ]
                }),
                whitelist: Whitelist.new(1673548139n, [
                    {
                        address: new Address(
                            '0x00000000219ab540356cbb839cbe05303d7705fa'
                        ),
                        allowFrom: 0n
                    }
                ]),
                surplus: SurplusParams.NO_FEE
            },
            {
                fees: Fees.integratorFee(
                    new IntegratorFee(
                        Address.fromBigInt(1n),
                        Address.fromBigInt(2n),
                        Bps.fromPercent(1),
                        Bps.fromPercent(50)
                    )
                )
            }
        )

        const builtOrder = order.build()
        expect(builtOrder).toStrictEqual({
            maker: '0x00000000219ab540356cbb839cbe05303d7705fa',
            makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            makingAmount: '1000000000000000000',
            receiver: extensionContract.toString(), // as there are fees
            takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            takingAmount: '1420000000',
            makerTraits:
                '33471150795161712739625987854073848363835856965607525350783622537007396290560',
            salt: '15235559042146644103405359194784496869858870199717'
        })

        const makerTraits = new MakerTraits(BigInt(builtOrder.makerTraits))
        expect(makerTraits.isNativeUnwrapEnabled()).toEqual(false)
        expect(makerTraits.nonceOrEpoch()).toEqual(0n)
        expect(makerTraits.isPartialFillAllowed()).toEqual(true)
    })
    it('should decode fusion order from order + extension', () => {
        const extensionContract = new Address(
            '0x8273f37417da37c4a6c3995e82cf442f87a25d9c'
        )

        const order = FusionOrder.new(
            extensionContract,
            {
                makerAsset: new Address(
                    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
                ),
                takerAsset: new Address(
                    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
                ),
                makingAmount: 1000000000000000000n,
                takingAmount: 1420000000n,
                maker: new Address(
                    '0x00000000219ab540356cbb839cbe05303d7705fa'
                ),
                salt: 10n
            },
            {
                auction: new AuctionDetails({
                    duration: 180n,
                    startTime: 1673548149n,
                    initialRateBump: 50000,
                    points: [
                        {
                            coefficient: 20000,
                            delay: 12
                        }
                    ]
                }),
                whitelist: Whitelist.new(0n, [
                    {
                        address: new Address(
                            '0x00000000219ab540356cbb839cbe05303d7705fa'
                        ),
                        allowFrom: 0n
                    }
                ]),
                surplus: SurplusParams.NO_FEE
            }
        )

        expect(
            FusionOrder.fromDataAndExtension(order.build(), order.extension)
        ).toStrictEqual(order)
    })

    it('should decode fusion order from order + extension with provided source', () => {
        const extensionContract = new Address(
            '0x8273f37417da37c4a6c3995e82cf442f87a25d9c'
        )

        const order = FusionOrder.new(
            extensionContract,
            {
                makerAsset: new Address(
                    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
                ),
                takerAsset: new Address(
                    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
                ),
                makingAmount: 1000000000000000000n,
                takingAmount: 1420000000n,
                maker: new Address(
                    '0x00000000219ab540356cbb839cbe05303d7705fa'
                ),
                salt: 10n
            },
            {
                auction: new AuctionDetails({
                    duration: 180n,
                    startTime: 1673548149n,
                    initialRateBump: 50000,
                    points: [
                        {
                            coefficient: 20000,
                            delay: 12
                        }
                    ]
                }),
                whitelist: Whitelist.new(0n, [
                    {
                        address: new Address(
                            '0x00000000219ab540356cbb839cbe05303d7705fa'
                        ),
                        allowFrom: 0n
                    }
                ]),
                surplus: SurplusParams.NO_FEE
            },
            {
                source: 'test'
            }
        )

        expect(
            FusionOrder.fromDataAndExtension(order.build(), order.extension)
        ).toStrictEqual(order)
    })

    it('Should calculate taking amount', () => {
        const now = 10000n
        const order = FusionOrder.new(
            new Address('0x8273f37417da37c4a6c3995e82cf442f87a25d9c'),
            {
                makerAsset: new Address(
                    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' // USDC
                ),
                takerAsset: new Address(
                    '0x111111111117dc0aa78b770fa6a738034120c302' // 1INCH
                ),
                maker: Address.fromBigInt(1n),
                makingAmount: parseUnits('150', 6),
                takingAmount: parseUnits('200')
            },
            {
                auction: new AuctionDetails({
                    startTime: now,
                    duration: 120n,
                    initialRateBump: 10_000_000, // 100%,
                    points: []
                }),
                whitelist: Whitelist.new(0n, [
                    {
                        address: new Address(
                            '0x00000000219ab540356cbb839cbe05303d7705fa'
                        ),
                        allowFrom: 0n
                    }
                ]),
                surplus: SurplusParams.NO_FEE
            },
            {
                source: 'some_id'
            }
        )

        expect(
            order.calcTakingAmount(
                Address.fromBigInt(1n),
                order.makingAmount,
                now
            )
        ).toEqual(
            2n * order.takingAmount // because init rate bump is 100%
        )
    })

    it('Should calculate fees', () => {
        const order = FusionOrder.fromDataAndExtension(
            {
                salt: '88244613754032523633323406134225422628418021814470407656044833909440411473904',
                maker: '0x6edc317f3208b10c46f4ff97faa04dd632487408',
                receiver: '0xabd4e5fb590aa132749bbf2a04ea57efbaac399e',
                makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                makerTraits:
                    '62419173104490761595518734106935910747442209877250655105498008304728645042176',
                makingAmount: '7340000000000000',
                takingAmount: '17733698'
            },
            new Extension({
                makerAssetSuffix: '0x',
                takerAssetSuffix: '0x',
                makingAmountData:
                    '0xabd4e5fb590aa132749bbf2a04ea57efbaac399e094c49000005f667a1b28a0000b41297d701094c4900b400643c00006402d1a23c3abeed63c51b86b5636af8f99b8e85dc9f',
                takingAmountData:
                    '0xabd4e5fb590aa132749bbf2a04ea57efbaac399e094c49000005f667a1b28a0000b41297d701094c4900b400643c00006402d1a23c3abeed63c51b86b5636af8f99b8e85dc9f',
                predicate: '0x',
                makerPermit: '0x',
                preInteraction: '0x',
                postInteraction:
                    '0xabd4e5fb590aa132749bbf2a04ea57efbaac399e008e097e5e0493de033270a01b324caf31f464dc6790cbe4bdd538d6e9b379bff5fe72c3d67a521de500643c00006467a1b27202d1a23c3abeed63c51b860000b5636af8f99b8e85dc9f0000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00',
                customData: '0x'
            })
        )

        const userAmount = order
            .getAmountCalculator()
            .getUserTakingAmount(
                Address.ZERO_ADDRESS,
                order.makingAmount,
                order.takingAmount,
                order.makingAmount,
                1738650311n,
                1533984564n
            )

        const integratorFee = order
            .getAmountCalculator()
            .getIntegratorFee(
                Address.ZERO_ADDRESS,
                order.takingAmount,
                1738650311n,
                1533984564n
            )
        const protocolFee = order
            .getAmountCalculator()
            .getProtocolFee(
                Address.ZERO_ADDRESS,
                order.takingAmount,
                1738650311n,
                1533984564n
            )

        expect(integratorFee).toEqual(11065n)
        expect(protocolFee).toEqual(7377n)
        expect(userAmount).toEqual(18442228n)
    })
    it('should calculate surplus fee - no surplus', () => {
        const currentTime = now()
        const takerAddress = Address.fromBigInt(1000n)

        const order = FusionOrder.new(
            Address.ZERO_ADDRESS,
            {
                maker: Address.fromBigInt(10n),
                makerAsset: Address.fromBigInt(1n),
                takerAsset: Address.fromBigInt(1n),
                makingAmount: parseEther('0.1'),
                takingAmount: parseUnits('100', 6) // will be 200 at time of fill because of rate bump
            },
            {
                auction: new AuctionDetails({
                    duration: 120n,
                    startTime: currentTime,
                    points: [],
                    initialRateBump: Number(
                        AuctionCalculator.RATE_BUMP_DENOMINATOR
                    )
                }),
                whitelist: Whitelist.new(0n, [
                    {address: takerAddress, allowFrom: 0n}
                ]),
                surplus: new SurplusParams(
                    parseUnits('250', 6),
                    Bps.fromPercent(50)
                )
            },
            {
                fees: new Fees(
                    new ResolverFee(
                        Address.fromBigInt(123n),
                        Bps.fromPercent(1)
                    ),
                    new IntegratorFee(
                        Address.fromBigInt(123n),
                        Address.fromBigInt(123n),
                        Bps.fromPercent(0.1),
                        Bps.fromPercent(10)
                    )
                )
            }
        )

        const makingAmount = parseEther('0.1') / 2n

        const userAmount = order.getUserReceiveAmount(
            takerAddress,
            makingAmount,
            currentTime
        )

        const surplus = order.getSurplusFee(
            takerAddress,
            makingAmount,
            currentTime
        )

        expect(userAmount).toEqual(100000000n)
        expect(surplus).toEqual(0n)
    })
    it('should calculate surplus fee - have surplus', () => {
        const currentTime = now()
        const takerAddress = Address.fromBigInt(1000n)

        const order = FusionOrder.new(
            Address.ZERO_ADDRESS,
            {
                maker: Address.fromBigInt(10n),
                makerAsset: Address.fromBigInt(1n),
                takerAsset: Address.fromBigInt(1n),
                makingAmount: parseEther('0.1'),
                takingAmount: parseUnits('100', 6) // will be 200 at time of fill because of rate bump
            },
            {
                auction: new AuctionDetails({
                    duration: 120n,
                    startTime: currentTime,
                    points: [],
                    initialRateBump: Number(
                        AuctionCalculator.RATE_BUMP_DENOMINATOR
                    )
                }),
                whitelist: Whitelist.new(0n, [
                    {address: takerAddress, allowFrom: 0n}
                ]),
                surplus: new SurplusParams(
                    parseUnits('100', 6),
                    Bps.fromPercent(50)
                )
            },
            {
                fees: new Fees(
                    new ResolverFee(
                        Address.fromBigInt(123n),
                        Bps.fromPercent(1)
                    ),
                    new IntegratorFee(
                        Address.fromBigInt(123n),
                        Address.fromBigInt(123n),
                        Bps.fromPercent(0.1),
                        Bps.fromPercent(10)
                    )
                )
            }
        )

        const makingAmount = parseEther('0.1') / 2n

        const userAmount = order.getUserReceiveAmount(
            takerAddress,
            makingAmount,
            currentTime
        )

        const surplus = order.getSurplusFee(
            takerAddress,
            makingAmount,
            currentTime
        )

        expect(userAmount).toEqual(75000000n)
        expect(surplus).toEqual(25000000n)
    })

    it('should fail to create fusion order with bad surplus params', () => {
        const extensionContract = new Address(
            '0x8273f37417da37c4a6c3995e82cf442f87a25d9c'
        )

        expect(() =>
            FusionOrder.new(
                extensionContract,
                {
                    makerAsset: new Address(
                        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
                    ),
                    takerAsset: new Address(
                        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
                    ),
                    makingAmount: 1000000000000000000n,
                    takingAmount: 1420000000n,
                    maker: new Address(
                        '0x00000000219ab540356cbb839cbe05303d7705fa'
                    ),
                    salt: 10n
                },
                {
                    auction: new AuctionDetails({
                        duration: 180n,
                        startTime: 1673548149n,
                        initialRateBump: 50000,
                        points: [
                            {
                                coefficient: 20000,
                                delay: 12
                            }
                        ]
                    }),
                    whitelist: Whitelist.new(1673548139n, [
                        {
                            address: new Address(
                                '0x00000000219ab540356cbb839cbe05303d7705fa'
                            ),
                            allowFrom: 0n
                        }
                    ]),
                    surplus: new SurplusParams(
                        1420000000n - 1n,
                        Bps.fromFraction(0.1)
                    )
                }
            )
        ).toThrow(
            'order.takingAmount must be less then surplusParams.estimatedTakerAmount'
        )
    })
})

describe('FusionOrder Native', () => {
    it('should correct detect that order is from native asset', () => {
        const ethOrderFactory = new ProxyFactory(
            Address.fromBigInt(1n),
            Address.fromBigInt(2n)
        )
        const chainId = NetworkEnum.ETHEREUM
        const settlementExt = Address.fromBigInt(3n)
        const maker = new Address('0x00000000219ab540356cbb839cbe05303d7705fa')
        const nativeOrder = FusionOrder.fromNative(
            chainId,
            ethOrderFactory,
            settlementExt,
            {
                takerAsset: new Address(
                    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
                ),
                makingAmount: 1000000000000000000n,
                takingAmount: 1420000000n,
                maker,
                salt: 10n
            },
            {
                auction: new AuctionDetails({
                    duration: 180n,
                    startTime: 1673548149n,
                    initialRateBump: 50000,
                    points: [
                        {
                            coefficient: 20000,
                            delay: 12
                        }
                    ]
                }),
                whitelist: Whitelist.new(1673548139n, [
                    {
                        address: new Address(
                            '0x00000000219ab540356cbb839cbe05303d7705fa'
                        ),
                        allowFrom: 0n
                    }
                ]),
                surplus: SurplusParams.NO_FEE
            }
        )

        expect(
            nativeOrder.isNative(
                chainId,
                ethOrderFactory,
                nativeOrder.nativeSignature(maker)
            )
        ).toEqual(true)

        expect(
            FusionOrder.fromDataAndExtension(
                nativeOrder.build(),
                nativeOrder.extension
            ).isNative(
                chainId,
                ethOrderFactory,
                nativeOrder.nativeSignature(maker)
            )
        ).toEqual(true)
    })

    it('should correct detect that order is from native asset (no salt)', () => {
        const ethOrderFactory = new ProxyFactory(
            new Address('0x62c650084e97a0fba2ecf365cc6d8a7722425363'),
            new Address('0xe8773a43fce4eedb18d0edbaf319059e1ae786af')
        )
        const chainId = NetworkEnum.ETHEREUM
        const settlementExt = new Address(
            '0x2ad5004c60e16e54d5007c80ce329adde5b51ef5'
        )
        const maker = new Address('0x962a836519109e162754161000d65d9dc027fa0f')
        const nativeOrder = FusionOrder.fromNative(
            chainId,
            ethOrderFactory,
            settlementExt,
            {
                takerAsset: new Address(
                    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
                ),
                makingAmount: 1000000000000000000n,
                takingAmount: 1420000000n,
                maker
            },
            {
                auction: new AuctionDetails({
                    duration: 180n,
                    startTime: 1673548149n,
                    initialRateBump: 50000,
                    points: [
                        {
                            coefficient: 20000,
                            delay: 12
                        }
                    ]
                }),
                whitelist: Whitelist.new(1673548139n, [
                    {
                        address: new Address(
                            '0x00000000219ab540356cbb839cbe05303d7705fa'
                        ),
                        allowFrom: 0n
                    }
                ]),
                surplus: SurplusParams.NO_FEE
            }
        )

        expect(
            nativeOrder.isNative(
                chainId,
                ethOrderFactory,
                nativeOrder.nativeSignature(maker)
            )
        ).toEqual(true)

        expect(
            FusionOrder.fromDataAndExtension(
                nativeOrder.build(),
                Extension.decode(nativeOrder.extension.encode())
            ).isNative(
                chainId,
                ethOrderFactory,
                nativeOrder.nativeSignature(maker)
            )
        ).toEqual(true)
    })

    it('should correct detect that order is NOT from native asset', () => {
        const ethOrderFactory = new ProxyFactory(
            Address.fromBigInt(1n),
            Address.fromBigInt(2n)
        )
        const chainId = NetworkEnum.ETHEREUM
        const settlementExt = Address.fromBigInt(3n)
        const maker = new Address('0x00000000219ab540356cbb839cbe05303d7705fa')
        const nativeOrder = FusionOrder.new(
            settlementExt,
            {
                makerAsset: new Address(
                    '0x1000000000000000000000000000000000000000'
                ),
                takerAsset: new Address(
                    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
                ),
                makingAmount: 1000000000000000000n,
                takingAmount: 1420000000n,
                maker,
                salt: 10n
            },
            {
                auction: new AuctionDetails({
                    duration: 180n,
                    startTime: 1673548149n,
                    initialRateBump: 50000,
                    points: [
                        {
                            coefficient: 20000,
                            delay: 12
                        }
                    ]
                }),
                whitelist: Whitelist.new(1673548139n, [
                    {
                        address: new Address(
                            '0x00000000219ab540356cbb839cbe05303d7705fa'
                        ),
                        allowFrom: 0n
                    }
                ]),
                surplus: SurplusParams.NO_FEE
            }
        )

        expect(
            nativeOrder.isNative(
                chainId,
                ethOrderFactory,
                nativeOrder.nativeSignature(maker)
            )
        ).toEqual(false)

        expect(
            FusionOrder.fromDataAndExtension(
                nativeOrder.build(),
                nativeOrder.extension
            ).isNative(
                chainId,
                ethOrderFactory,
                nativeOrder.nativeSignature(maker)
            )
        ).toEqual(false)
    })

    it('should have extension address in receiver if surplus passed', () => {
        const ethOrderFactory = new ProxyFactory(
            Address.fromBigInt(1n),
            Address.fromBigInt(2n)
        )
        const chainId = NetworkEnum.ETHEREUM
        const settlementExt = Address.fromBigInt(3n)
        const maker = new Address('0x00000000219ab540356cbb839cbe05303d7705fa')
        const nativeOrder = FusionOrder.fromNative(
            chainId,
            ethOrderFactory,
            settlementExt,
            {
                takerAsset: new Address(
                    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
                ),
                makingAmount: 1000000000000000000n,
                takingAmount: 1420000000n,
                maker,
                salt: 10n
            },
            {
                auction: new AuctionDetails({
                    duration: 180n,
                    startTime: 1673548149n,
                    initialRateBump: 50000,
                    points: [
                        {
                            coefficient: 20000,
                            delay: 12
                        }
                    ]
                }),
                whitelist: Whitelist.new(1673548139n, [
                    {
                        address: new Address(
                            '0x00000000219ab540356cbb839cbe05303d7705fa'
                        ),
                        allowFrom: 0n
                    }
                ]),
                surplus: new SurplusParams(1420000000n * 2n, new Bps(10000n))
            }
        )

        expect(nativeOrder.build().receiver).toEqual(settlementExt.toString())
    })
})

describe('FusionOrder preInteraction', () => {
    it('should create order with preInteraction and set PRE_INTERACTION_CALL_FLAG in makerTraits', () => {
        const extensionContract = new Address(
            '0x2ad5004c60e16e54d5007c80ce329adde5b51ef5'
        )

        const preInteraction = new Interaction(
            new Address('0x3a617c2fbaf8d7c58c793fbbd2d14eb4927876c1'),
            '0xdeadbeef01020304'
        )

        const order = FusionOrder.new(
            extensionContract,
            {
                makerAsset: new Address(
                    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
                ),
                takerAsset: new Address(
                    '0xda7ad9dea9397cffddae2f8a052b82f1484252b3'
                ),
                makingAmount: 1983000000000000n,
                takingAmount: 79052953622246027n,
                maker: new Address('0x3a617c2fbaf8d7c58c793fbbd2d14eb4927876c1')
            },
            {
                auction: new AuctionDetails({
                    duration: 180n,
                    startTime: 1673548149n,
                    initialRateBump: 50000,
                    points: [{coefficient: 20000, delay: 12}]
                }),
                whitelist: Whitelist.new(1673548139n, [
                    {
                        address: new Address(
                            '0x00000000219ab540356cbb839cbe05303d7705fa'
                        ),
                        allowFrom: 0n
                    }
                ]),
                surplus: SurplusParams.NO_FEE
            },
            {
                preInteraction: preInteraction.encode()
            }
        )

        const makerTraits = new MakerTraits(BigInt(order.build().makerTraits))

        expect(makerTraits.hasPreInteraction()).toBe(true)
    })

    it('should not set PRE_INTERACTION_CALL_FLAG when no preInteraction', () => {
        const extensionContract = new Address(
            '0x2ad5004c60e16e54d5007c80ce329adde5b51ef5'
        )

        const order = FusionOrder.new(
            extensionContract,
            {
                makerAsset: new Address(
                    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
                ),
                takerAsset: new Address(
                    '0xda7ad9dea9397cffddae2f8a052b82f1484252b3'
                ),
                makingAmount: 1983000000000000n,
                takingAmount: 79052953622246027n,
                maker: new Address('0x3a617c2fbaf8d7c58c793fbbd2d14eb4927876c1')
            },
            {
                auction: new AuctionDetails({
                    duration: 180n,
                    startTime: 1673548149n,
                    initialRateBump: 50000,
                    points: [{coefficient: 20000, delay: 12}]
                }),
                whitelist: Whitelist.new(1673548139n, [
                    {
                        address: new Address(
                            '0x00000000219ab540356cbb839cbe05303d7705fa'
                        ),
                        allowFrom: 0n
                    }
                ]),
                surplus: SurplusParams.NO_FEE
            }
        )

        const makerTraits = new MakerTraits(BigInt(order.build().makerTraits))

        expect(makerTraits.hasPreInteraction()).toBe(false)
    })

    it('should round-trip order with preInteraction via fromDataAndExtension', () => {
        const extensionContract = new Address(
            '0x2ad5004c60e16e54d5007c80ce329adde5b51ef5'
        )

        const preInteractionTarget = new Address(
            '0x3a617c2fbaf8d7c58c793fbbd2d14eb4927876c1'
        )
        const preInteractionCalldata =
            '0x0599a1fd1975848548e5b765925a935093a96ecc6f2ca216f77dcfd328b8a491'
        const preInteraction = new Interaction(
            preInteractionTarget,
            preInteractionCalldata
        )

        const order = FusionOrder.new(
            extensionContract,
            {
                makerAsset: new Address(
                    '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c'
                ),
                takerAsset: new Address(
                    '0xda7ad9dea9397cffddae2f8a052b82f1484252b3'
                ),
                makingAmount: 1983000000000000n,
                takingAmount: 79052953622246027n,
                maker: new Address('0x3a617c2fbaf8d7c58c793fbbd2d14eb4927876c1')
            },
            {
                auction: new AuctionDetails({
                    duration: 180n,
                    startTime: 1673548149n,
                    initialRateBump: 50000,
                    points: [{coefficient: 20000, delay: 12}]
                }),
                whitelist: Whitelist.new(1673548139n, [
                    {
                        address: new Address(
                            '0x00000000219ab540356cbb839cbe05303d7705fa'
                        ),
                        allowFrom: 0n
                    }
                ]),
                surplus: SurplusParams.NO_FEE
            },
            {
                preInteraction: preInteraction.encode()
            }
        )

        const built = order.build()
        const extension = order.extension

        const restored = FusionOrder.fromDataAndExtension(
            {
                salt: built.salt,
                maker: built.maker,
                receiver: built.receiver,
                makerAsset: built.makerAsset,
                takerAsset: built.takerAsset,
                makerTraits: built.makerTraits,
                makingAmount: built.makingAmount,
                takingAmount: built.takingAmount
            },
            extension
        )

        expect(restored.build().salt).toEqual(built.salt)
        expect(restored.extension.encode()).toEqual(extension.encode())
    })

    it('should validate OKX order with preInteraction (real customer data)', () => {
        const extensionHex =
            '0x000002b800000207000000d2000000d2000000d20000006900000000000000002ad5004c60e16e54d5007c80ce329adde5b51ef50000000000000069c930cb0000b403e4e400000000000064062324dfe7924cb4f3257d000000000000000000006ea9a11ae13b29f5c555d18bd45f0b94f54a968faa848f727be12534f24895770895ad27ad6b0d952ad5004c60e16e54d5007c80ce329adde5b51ef50000000000000069c930cb0000b403e4e400000000000064062324dfe7924cb4f3257d000000000000000000006ea9a11ae13b29f5c555d18bd45f0b94f54a968faa848f727be12534f24895770895ad27ad6b0d953a617c2fbaf8d7c58c793fbbd2d14eb4927876c10100000000000000000000000000000000000000000000000000000000000000a0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000070b872a96f0000000000000000000000000000000000000000000000000006715eae5b898683d0000000000000000000000000000000000000000000000000000000069c931e800000000000000000000000000000000000000000000000000000000000000410599a1fd1975848548e5b765925a935093a96ecc6f2ca216f77dcfd328b8a4917028648ec3e33d048184f9877d4892fb829ddc5d75a19c1c2ef064d2a38c012b1b000000000000000000000000000000000000000000000000000000000000002ad5004c60e16e54d5007c80ce329adde5b51ef500000000000000000000000000000000000000000090cbe4bdd538d6e9b379bff5fe72c3d67a521de500000000006469c930cb062324dfe7924cb4f3257d000c0000000000000000000000006ea9a11ae13b29f5c5550000d18bd45f0b94f54a968f0000aa848f727be12534f248000095770895ad27ad6b0d950000ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00'

        const extension = Extension.decode(extensionHex)

        expect(() => {
            FusionOrder.fromDataAndExtension(
                {
                    maker: '0x3a617c2fbaf8d7c58c793fbbd2d14eb4927876c1',
                    makerAsset: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
                    makerTraits:
                        '69656178681823023809491920669288819567982727296017585526061607372909138935808',
                    makingAmount: '1983000000000000',
                    receiver: '0xb698362cc878094c406115efeeb13089b544e6c8',
                    salt: '1084071965642925953405739669729447852001208220133',
                    takerAsset: '0xda7ad9dea9397cffddae2f8a052b82f1484252b3',
                    takingAmount: '79052953622246027'
                },
                extension
            )
        }).not.toThrow()
    })
})
