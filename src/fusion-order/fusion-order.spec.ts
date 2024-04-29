import {Address, Extension, MakerTraits} from '@1inch/limit-order-sdk'
import {parseUnits} from 'ethers'
import {FusionOrder} from './fusion-order'
import {AuctionDetails} from './auction-details'

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
                whitelist: [
                    {
                        address: new Address(
                            '0x00000000219ab540356cbb839cbe05303d7705fa'
                        ),
                        allowFrom: 0n
                    }
                ],
                resolvingStartTime: 1673548139n
            }
        )

        const builtOrder = order.build()
        expect(builtOrder).toStrictEqual({
            maker: '0x00000000219ab540356cbb839cbe05303d7705fa',
            makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            makingAmount: '1000000000000000000',
            receiver: '0x0000000000000000000000000000000000000000',
            takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            takingAmount: '1420000000',
            makerTraits:
                '33471150795161712739625987854073848363835856965607525350783622537007396290560',
            salt: '14969955465678758833706505435513058355190519874774'
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
                whitelist: [
                    {
                        address: new Address(
                            '0x00000000219ab540356cbb839cbe05303d7705fa'
                        ),
                        allowFrom: 0n
                    }
                ]
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
                whitelist: [
                    {
                        address: new Address(
                            '0x00000000219ab540356cbb839cbe05303d7705fa'
                        ),
                        allowFrom: 0n
                    }
                ]
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
                whitelist: [
                    {
                        address: new Address(
                            '0x00000000219ab540356cbb839cbe05303d7705fa'
                        ),
                        allowFrom: 0n
                    }
                ],
                resolvingStartTime: 0n
            },
            {
                source: 'some_id'
            }
        )

        expect(order.calcTakingAmount(order.makingAmount, now)).toEqual(
            2n * order.takingAmount // because init rate bump is 100%
        )
    })

    it('Should calculate taking amount 2', () => {
        const order = FusionOrder.fromDataAndExtension(
            {
                salt: '9445680526437905167361671445680544159946878658630243245775199089669376863246',
                maker: '0x6edc317f3208b10c46f4ff97faa04dd632487408',
                receiver: '0x0000000000000000000000000000000000000000',
                makerAsset: '0x6b175474e89094c44da98b954eedeac495271d0f',
                takerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                makerTraits:
                    '62419173104490761595518734106245825327156011637372339461913926769802108469248',
                makingAmount: '100000000000000000000',
                takingAmount: '29266814473325164'
            },
            Extension.decode(
                '0x000000cb0000005e0000005e0000005e0000005e0000002f0000000000000000fb2809a5314473e1165f6b58018e20ed8f07b84000000000000000662f5c9b0002580d653601a4b500180bc0800048fb2809a5314473e1165f6b58018e20ed8f07b84000000000000000662f5c9b0002580d653601a4b500180bc0800048fb2809a5314473e1165f6b58018e20ed8f07b840662f5c83b09498030ae3416b66dc00007bf29735c20c566e5a0c0000950fa635aec75b30781a0000d18bd45f0b94f54a968f000076d49414ad2b8371a4220000a59ca88d5813e693528f000038700d5181a674fdb9a2000038'
            )
        )
        const now = 1714380275n
        const baseFee = 10844562822n

        expect(
            order.calcTakingAmount(order.makingAmount, now, baseFee)
        ).toEqual(30411732255521644n)
    })
})
