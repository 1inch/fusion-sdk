import {FusionOrder} from './fusion-order'
import {AuctionDetails} from '../auction-details'
import {PostInteractionData} from '../post-interaction-data'
import {NetworkEnum} from '../constants'
import {Address} from '../address'

describe('Fusion Order', () => {
    it('should create fusion order', () => {
        const auctionStartTime = 1673548149n
        const auctionDetails = new AuctionDetails({
            duration: 180,
            auctionStartTime,
            initialRateBump: 50000,
            points: [
                {
                    coefficient: 20000,
                    delay: 12
                }
            ]
        })

        const postInteractionData = PostInteractionData.new({
            whitelist: [
                {
                    address: new Address(
                        '0x00000000219ab540356cbb839cbe05303d7705fa'
                    ),
                    allowance: 0
                }
            ],
            auctionStartTime,
            bankFee: 0n
        })

        const order = new FusionOrder(
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
                network: NetworkEnum.ETHEREUM,
                salt: 10n
            },
            auctionDetails,
            postInteractionData,
            {
                deadline: auctionStartTime + 180n,
                unwrapWETH: false
            }
        )

        expect(order.build()).toStrictEqual({
            maker: '0x00000000219ab540356cbb839cbe05303d7705fa',
            makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            makingAmount: '1000000000000000000',
            receiver: '0x0000000000000000000000000000000000000000',
            takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            takingAmount: '1420000000',
            makerTraits:
                '87748692625153679344424887076896305170056162277626525237169529665166579335168',
            salt: '15899499410621535437654919479712770641313696078058'
        })
    })
})
