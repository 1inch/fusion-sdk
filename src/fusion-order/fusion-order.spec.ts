import {FusionOrder} from './fusion-order'
import {AuctionSalt} from '../auction-salt'
import {AuctionSuffix} from '../auction-suffix'
import crypto from 'crypto'
import {NetworkEnum, SETTLEMENT_CONTRACT_ADDRESS_MAP} from '../constants'

describe('Fusion Order', () => {
    jest.spyOn(crypto.webcrypto, 'getRandomValues').mockImplementation(
        () => new Int8Array([9, 10, 10, 10, 10])
    )

    it('should create fusion order', () => {
        const salt = new AuctionSalt({
            duration: 180,
            auctionStartTime: 1673548149,
            initialRateBump: 50000,
            bankFee: '0'
        })

        const suffix = new AuctionSuffix({
            points: [
                {
                    coefficient: 20000,
                    delay: 12
                }
            ],
            whitelist: [
                {
                    address: '0x00000000219ab540356cbb839cbe05303d7705fa',
                    allowance: 0
                }
            ]
        })

        const order = new FusionOrder(
            {
                makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                makingAmount: '1000000000000000000',
                takingAmount: '1420000000',
                maker: '0x00000000219ab540356cbb839cbe05303d7705fa',
                network: NetworkEnum.ETHEREUM
            },
            salt,
            suffix
        )

        expect(order.build()).toStrictEqual({
            allowedSender: SETTLEMENT_CONTRACT_ADDRESS_MAP[NetworkEnum.ETHEREUM],
            interactions:
                '0x000c004e200000000000000000219ab540356cbb839cbe05303d7705faf486570009',
            maker: '0x00000000219ab540356cbb839cbe05303d7705fa',
            makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            makingAmount: '1000000000000000000',
            offsets: '0',
            receiver: '0x0000000000000000000000000000000000000000',
            salt: '45118768841948961586167738353692277076075522015101619148498725069326976558864',
            takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            takingAmount: '1420000000'
        })
    })
})
