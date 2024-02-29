import {FusionOrder} from './fusion-order'
import {AuctionDetails} from '../auction-details'
import {PostInteractionData} from '../post-interaction-data'
import {NetworkEnum} from '../constants'
import {Address} from '../address'
import {MakerTraits} from '../limit-order'

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

        const deadline = auctionStartTime + 180n
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
            {deadline}
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
                '29852648006495581632639394572552351243421169944806243217440737661210014515200',
            salt: '14832508939800728556409473652845244531014097925085'
        })

        const makerTraits = new MakerTraits(BigInt(builtOrder.makerTraits))
        expect(makerTraits.isNativeUnwrapEnabled()).toEqual(false)
        expect(makerTraits.expiration()).toEqual(deadline)
        expect(makerTraits.nonceOrEpoch()).toEqual(0n)
        expect(makerTraits.isPartialFilledAllowed()).toEqual(true)
    })
})
