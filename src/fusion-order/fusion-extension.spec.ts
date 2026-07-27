import {Address, Bps, Extension} from '@1inch/limit-order-sdk'
import {FusionOrder} from './fusion-order.js'
import {AuctionDetails} from './auction-details/index.js'
import {FusionExtension} from './fusion-extension.js'
import {Whitelist} from './whitelist/index.js'
import {SurplusParams} from './surplus-params.js'
import {Fees, IntegratorFee, ResolverFee} from './fees/index.js'
import type {Extra} from './types.js'

describe('FusionExtension', () => {
    it('should decode', () => {
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
        const fusionExtension = FusionExtension.decode(order.extension.encode())
        expect(fusionExtension).toStrictEqual(order.fusionExtension)
    })

    it('should decode with permit', () => {
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
                permit: '0xdeadbeef'
            }
        )
        const fusionExtension = FusionExtension.decode(order.extension.encode())
        expect(fusionExtension).toStrictEqual(order.fusionExtension)
    })

    it('should encode chained post interaction tail', () => {
        const extensionContract = new Address(
            '0x8273f37417da37c4a6c3995e82cf442f87a25d9c'
        )
        const module = new Address('0x593a321a1b5ff516eb6eee2c752a8ee7097d5119')
        const moduleData = '0xabcdef'
        const chainedPostInteraction = module.toString() + moduleData.slice(2)

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
                chainedPostInteraction
            }
        )

        expect(
            order.extension.postInteraction.endsWith(
                chainedPostInteraction.slice(2)
            )
        ).toBe(true)
        expect(
            order.fusionExtension.extra?.chainedPostInteraction?.target.equal(
                module
            )
        ).toBe(true)
        expect(
            order.fusionExtension.extra?.chainedPostInteraction?.encode()
        ).toBe(chainedPostInteraction)
        expect(FusionExtension.decode(order.extension.encode())).toStrictEqual(
            order.fusionExtension
        )
    })

    it('should concatenate chained post interaction chunks', () => {
        const extensionContract = new Address(
            '0x8273f37417da37c4a6c3995e82cf442f87a25d9c'
        )
        const first = '0x593a321a1b5ff516eb6eee2c752a8ee7097d5119abcdef'
        const second = '0x8273f37417da37c4a6c3995e82cf442f87a25d9c1234'

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
                chainedPostInteraction: [first, second]
            }
        )

        const postInteraction = order.extension.postInteraction
        const expectedTail = first + second.slice(2)

        expect(byteLength(postInteraction)).toBe(117 + byteLength(expectedTail))
        expect(postInteraction.slice(0, 42)).toBe(extensionContract.toString())
        expect(byteAt(postInteraction, 20)).toBe('00')
        expect(byteAt(postInteraction, 71)).toBe('01')
        expect(postInteraction.slice(-byteLength(expectedTail) * 2)).toBe(
            expectedTail.slice(2)
        )
        expect(
            order.fusionExtension.extra?.chainedPostInteraction?.encode()
        ).toBe(expectedTail)
        expect(FusionExtension.decode(order.extension.encode())).toStrictEqual(
            order.fusionExtension
        )
    })

    it('should decode extension without chained post interaction tail', () => {
        const order = buildOrder()

        expect(
            order.fusionExtension.extra?.chainedPostInteraction
        ).toBeUndefined()

        const decoded = FusionExtension.decode(order.extension.encode())

        expect(decoded.extra?.chainedPostInteraction).toBeUndefined()
        expect(decoded).toStrictEqual(order.fusionExtension)
        expect(decoded.build().encode()).toBe(order.extension.encode())
    })

    it('should round trip target only chained post interaction tail', () => {
        const module = new Address('0x593a321a1b5ff516eb6eee2c752a8ee7097d5119')
        const order = buildOrder({chainedPostInteraction: module.toString()})
        const chained = order.fusionExtension.extra?.chainedPostInteraction

        expect(chained?.target.equal(module)).toBe(true)
        expect(chained?.data).toBe('0x')
        expect(chained?.encode()).toBe(module.toString())

        const decoded = FusionExtension.decode(order.extension.encode())

        expect(decoded).toStrictEqual(order.fusionExtension)
        expect(decoded.build().encode()).toBe(order.extension.encode())
    })

    it('should round trip chained post interaction tail with fees, custom receiver, permit and surplus', () => {
        const chainedPostInteraction =
            '0x593a321a1b5ff516eb6eee2c752a8ee7097d5119abcdef'
        const customReceiver = new Address(
            '0x1111111111111111111111111111111111111111'
        )
        const order = buildOrder(
            {
                chainedPostInteraction,
                permit: '0xdeadbeef',
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
            },
            {
                receiver: customReceiver,
                surplus: new SurplusParams(2840000000n, Bps.fromPercent(50))
            }
        )

        const decoded = FusionExtension.decode(order.extension.encode())

        expect(decoded.extra?.customReceiver?.equal(customReceiver)).toBe(true)
        expect(decoded.extra?.chainedPostInteraction?.encode()).toBe(
            chainedPostInteraction
        )
        expect(decoded).toStrictEqual(order.fusionExtension)
        expect(decoded.build().encode()).toBe(order.extension.encode())
    })

    it('should reject invalid chained post interaction at build time', () => {
        // shorter than 20 bytes target address
        expect(() => buildOrder({chainedPostInteraction: '0x1234'})).toThrow(
            'invalid interaction'
        )
        // not valid hex bytes
        expect(() =>
            buildOrder({
                chainedPostInteraction:
                    '0xzz3a321a1b5ff516eb6eee2c752a8ee7097d5119'
            })
        ).toThrow('invalid chained post-interaction chunk')
        // odd length chunks must not silently merge into valid looking bytes
        expect(() =>
            buildOrder({
                chainedPostInteraction: [
                    '0x593a321a1b5ff516eb6eee2c752a8ee7097d5119a',
                    '0xb'
                ]
            })
        ).toThrow('invalid chained post-interaction chunk')
    })

    it('should throw on decode when tail is shorter than 20 bytes', () => {
        const extension = buildOrder().extension
        const tampered = new Extension({
            makerAssetSuffix: extension.makerAssetSuffix,
            takerAssetSuffix: extension.takerAssetSuffix,
            makingAmountData: extension.makingAmountData,
            takingAmountData: extension.takingAmountData,
            predicate: extension.predicate,
            makerPermit: extension.makerPermit,
            preInteraction: extension.preInteraction,
            postInteraction: extension.postInteraction + 'deadbeef',
            customData: extension.customData
        })

        expect(() => FusionExtension.fromExtension(tampered)).toThrow(
            'invalid interaction'
        )
    })
})

function buildOrder(
    extra?: Extra,
    opts?: {receiver?: Address; surplus?: SurplusParams}
): FusionOrder {
    return FusionOrder.new(
        new Address('0x8273f37417da37c4a6c3995e82cf442f87a25d9c'),
        {
            makerAsset: new Address(
                '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
            ),
            takerAsset: new Address(
                '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
            ),
            makingAmount: 1000000000000000000n,
            takingAmount: 1420000000n,
            maker: new Address('0x00000000219ab540356cbb839cbe05303d7705fa'),
            receiver: opts?.receiver,
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
            surplus: opts?.surplus ?? SurplusParams.NO_FEE
        },
        extra
    )
}

function byteLength(hex: string): number {
    return (hex.length - 2) / 2
}

function byteAt(hex: string, index: number): string {
    return hex.slice(2 + index * 2, 4 + index * 2)
}
