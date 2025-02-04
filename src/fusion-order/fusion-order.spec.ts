import {
    Address,
    Bps,
    MakerTraits,
    FeeTakerExt,
    Extension
} from '@1inch/limit-order-sdk'
import {parseUnits} from 'ethers'
import {FusionOrder} from './fusion-order'
import {AuctionDetails} from './auction-details'
import {Whitelist} from './whitelist'

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
                ])
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
            salt: '15154917212229274031775300768002549554250257257796'
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
                ])
            },
            {
                fees: FeeTakerExt.Fees.integratorFee(
                    new FeeTakerExt.IntegratorFee(
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
            salt: '14784889872407883648102551457165962490230021209460'
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
                ])
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
                ])
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
                ])
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

    it('Should calculate total fee', () => {
        // https://etherscan.io/tx/0x8f95dc0e6e836ca0abdad88e20cf61b0caf7c5463d67b577740f3084d428e56e
        const data = [
            {
                order: '{"salt": "88244613754032523633323406132962387804442696513566413874801304436628426636029", "maker": "0x6edc317f3208b10c46f4ff97faa04dd632487408", "receiver": "0xabd4e5fb590aa132749bbf2a04ea57efbaac399e", "makerAsset": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "takerAsset": "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", "makerTraits": "62419173104490761595518734106935910747442209877250655105498008304728645042176", "makingAmount": "7340000000000000", "takingAmount": "17733698"}',
                extension:
                    '0x000000ec0000008c0000008c0000008c0000008c000000460000000000000000abd4e5fb590aa132749bbf2a04ea57efbaac399e094c49000005f667a1b28a0000b41297d701094c4900b400643c00006402d1a23c3abeed63c51b86b5636af8f99b8e85dc9fabd4e5fb590aa132749bbf2a04ea57efbaac399e094c49000005f667a1b28a0000b41297d701094c4900b400643c00006402d1a23c3abeed63c51b86b5636af8f99b8e85dc9fabd4e5fb590aa132749bbf2a04ea57efbaac399e008e097e5e0493de033270a01b324caf31f464dc6790cbe4bdd538d6e9b379bff5fe72c3d67a521de500643c00006467a1b27202d1a23c3abeed63c51b860000b5636af8f99b8e85dc9f0000'
            }
        ]

        const order = FusionOrder.fromDataAndExtension(
            JSON.parse(data[0].order),
            Extension.decode(data[0].extension)
        )

        const userAmount = order
            .getAmountCalculator()
            .getUserTakingAmountAmount(
                Address.ZERO_ADDRESS,
                order.takingAmount,
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

        expect(userAmount).toEqual(18442228n)
        expect(integratorFee).toEqual(11065n)
        expect(protocolFee).toEqual(7377n)
    })
})
