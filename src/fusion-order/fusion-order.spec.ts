import {Address, MakerTraits} from '@1inch/limit-order-sdk'
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
            receiver: extensionContract.toString(),
            takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            takingAmount: '1420000000',
            makerTraits:
                '33471150795161712739625987854073848363835856965607525350783622537007396290560',
            salt: '15150891855335877009553113668813008135841821470374'
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
})
