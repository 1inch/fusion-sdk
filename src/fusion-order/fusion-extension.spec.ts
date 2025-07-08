import {Address} from '@1inch/limit-order-sdk'
import {FusionOrder} from './fusion-order.js'
import {AuctionDetails} from './auction-details/index.js'
import {FusionExtension} from './fusion-extension.js'
import {Whitelist} from './whitelist/index.js'
import {SurplusParams} from './surplus-params.js'

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
})
