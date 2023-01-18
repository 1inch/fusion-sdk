import {LimitOrder} from './limit-order'
import {PredicateFactory} from './predicate-factory'
import {InteractionsFactory} from './interactions-factory'
import {LimitOrderV3Struct} from './types'

describe('Limit Order', () => {
    jest.spyOn(Math, 'random').mockReturnValue(1)
    jest.spyOn(Date, 'now').mockReturnValue(1673549418040)

    it('should create limit order', () => {
        const order = new LimitOrder({
            makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            makingAmount: '1000000000000000000',
            takingAmount: '1420000000',
            maker: '0x00000000219ab540356cbb839cbe05303d7705fa'
        })

        expect(order.build()).toStrictEqual({
            allowedSender: '0x0000000000000000000000000000000000000000',
            interactions: '0x',
            maker: '0x00000000219ab540356cbb839cbe05303d7705fa',
            makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            makingAmount: '1000000000000000000',
            offsets: '0',
            receiver: '0x0000000000000000000000000000000000000000',
            salt: '1673549418040',
            takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            takingAmount: '1420000000'
        })
    })

    it('should create limit order with timestampBelow predicate', () => {
        const order = new LimitOrder(
            {
                makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                makingAmount: '1000000000000000000',
                takingAmount: '1420000000',
                maker: '0x00000000219ab540356cbb839cbe05303d7705fa'
            },
            {
                predicate: PredicateFactory.timestampBelow(1673549418)
            }
        )

        expect(order.build()).toStrictEqual({
            allowedSender: '0x0000000000000000000000000000000000000000',
            interactions:
                '0x63592c2b0000000000000000000000000000000000000000000000000000000063c0566a',
            maker: '0x00000000219ab540356cbb839cbe05303d7705fa',
            makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            makingAmount: '1000000000000000000',
            offsets:
                '970558080243398695134547109586957793750899628853613079895592438595584',
            receiver: '0x0000000000000000000000000000000000000000',
            salt: '1673549418040',
            takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            takingAmount: '1420000000'
        })
    })

    it('should create limit order with timestampBelow predicate that will unwrap maker weth to eth', () => {
        const order = new LimitOrder(
            {
                makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                makingAmount: '1000000000000000000',
                takingAmount: '1420000000',
                maker: '0x00000000219ab540356cbb839cbe05303d7705fa'
            },
            {
                predicate: PredicateFactory.timestampBelow(1673549418),
                postInteraction: InteractionsFactory.unwrap(
                    '0x08b067ad41e45babe5bbb52fc2fe7f692f628b06',
                    '0x00000000219ab540356cbb839cbe05303d7705fa'
                )
            }
        )

        expect(order.build()).toStrictEqual({
            allowedSender: '0x0000000000000000000000000000000000000000',
            interactions:
                '0x63592c2b0000000000000000000000000000000000000000000000000000000063c0566a08b067ad41e45babe5bbb52fc2fe7f692f628b0600000000219ab540356cbb839cbe05303d7705fa',
            maker: '0x00000000219ab540356cbb839cbe05303d7705fa',
            makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            makingAmount: '1000000000000000000',
            offsets:
                '2048955946929424286921227713067743020696385405755235979139736848564224',
            receiver: '0x0000000000000000000000000000000000000000',
            salt: '1673549418040',
            takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            takingAmount: '1420000000'
        })
    })

    it('should decode limit order struct', () => {
        const orderStruct: LimitOrderV3Struct = {
            allowedSender: '0x0000000000000000000000000000000000000000',
            interactions:
                '0x63592c2b0000000000000000000000000000000000000000000000000000000063c0566a08b067ad41e45babe5bbb52fc2fe7f692f628b0600000000219ab540356cbb839cbe05303d7705fa',
            maker: '0x00000000219ab540356cbb839cbe05303d7705fa',
            makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            makingAmount: '1000000000000000000',
            offsets:
                '2048955946929424286921227713067743020696385405755235979139736848564224',
            receiver: '0x0000000000000000000000000000000000000000',
            salt: '1673549418040',
            takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            takingAmount: '1420000000'
        }

        const order = LimitOrder.decode(orderStruct)

        expect(order.build()).toStrictEqual(orderStruct)
    })

    it('should get limit order typed data', () => {
        const order = new LimitOrder({
            makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            makingAmount: '1000000000000000000',
            takingAmount: '1420000000',
            maker: '0x00000000219ab540356cbb839cbe05303d7705fa'
        })

        expect(order.getTypedData()).toStrictEqual({
            domain: {
                chainId: 1,
                name: '1inch Aggregation Router',
                verifyingContract: '0x1111111254eeb25477b68fb85ed929f73a960582',
                version: '5'
            },
            message: {
                allowedSender: '0x0000000000000000000000000000000000000000',
                interactions: '0x',
                maker: '0x00000000219ab540356cbb839cbe05303d7705fa',
                makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                makingAmount: '1000000000000000000',
                offsets: '0',
                receiver: '0x0000000000000000000000000000000000000000',
                salt: '1673549418040',
                takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                takingAmount: '1420000000'
            },
            primaryType: 'Order',
            types: {
                EIP712Domain: [
                    {
                        name: 'name',
                        type: 'string'
                    },
                    {
                        name: 'version',
                        type: 'string'
                    },
                    {
                        name: 'chainId',
                        type: 'uint256'
                    },
                    {
                        name: 'verifyingContract',
                        type: 'address'
                    }
                ],
                Order: [
                    {
                        name: 'salt',
                        type: 'uint256'
                    },
                    {
                        name: 'makerAsset',
                        type: 'address'
                    },
                    {
                        name: 'takerAsset',
                        type: 'address'
                    },
                    {
                        name: 'maker',
                        type: 'address'
                    },
                    {
                        name: 'receiver',
                        type: 'address'
                    },
                    {
                        name: 'allowedSender',
                        type: 'address'
                    },
                    {
                        name: 'makingAmount',
                        type: 'uint256'
                    },
                    {
                        name: 'takingAmount',
                        type: 'uint256'
                    },
                    {
                        name: 'offsets',
                        type: 'uint256'
                    },
                    {
                        name: 'interactions',
                        type: 'bytes'
                    }
                ]
            }
        })
    })

    it('should get limit order hash', () => {
        const order = new LimitOrder({
            makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            makingAmount: '1000000000000000000',
            takingAmount: '1420000000',
            maker: '0x00000000219ab540356cbb839cbe05303d7705fa'
        })

        expect(order.getOrderHash()).toBe(
            '0x4bdb758d3d4b265367c461cdb12b2fbe92fd8f2bcc9423393e9da4490d6157c4'
        )
    })
})
