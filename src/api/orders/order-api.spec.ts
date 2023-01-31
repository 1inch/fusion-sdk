import {HttpProviderConnector} from '../../connector'
import {NetworkEnum} from '../../constants'
import {FusionSDK} from '../../sdk/sdk'

function createHttpProviderFake<T>(mock: T): HttpProviderConnector {
    const httpProvider: HttpProviderConnector = {
        get: jest.fn().mockImplementationOnce(() => {
            return Promise.resolve(mock)
        }),
        post: jest.fn().mockImplementation(() => {
            return Promise.resolve(null)
        })
    }

    return httpProvider
}

describe(__filename, () => {
    describe('getActiveOrders', () => {
        it('success', async () => {
            const expected = {
                items: [
                    {
                        orderHash:
                            '0xe07193d683bb70f7c9a45001b863dd9058146849bdd47951b6d0ed13b1fd8396',
                        signature:
                            '0x21ef770f9bedbb97542033bd3b1a2ad611917567102545c93ce66668b8524b7c609bead7829113e104be41fbbd14fea027c85bc4668214b81d52f02c2f9010551b',
                        deadline: '2023-01-31T11:01:02.000Z',
                        auctionStartDate: '2023-01-31T10:58:02.000Z',
                        auctionEndDate: '2023-01-31T11:01:02.000Z',
                        order: {
                            salt: '45162296565521316310143660684688589556990590668045350709106347387233721386087',
                            maker: '0x84d99aa569d93a9ca187d83734c8c4a519c4e9b1',
                            offsets:
                                '2048955946929424286921227713067743020696385405755235979139736848564224',
                            receiver:
                                '0x08b067ad41e45babe5bbb52fc2fe7f692f628b06',
                            makerAsset:
                                '0xe68a2c0eef74b5d8d2975bbf7a681226e4d7473c',
                            takerAsset:
                                '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                            interactions:
                                '0x63592c2b0000000000000000000000000000000000000000000000000000000063d8f4ee08b067ad41e45babe5bbb52fc2fe7f692f628b06315b47a8c3780434b153667588db4ca628526e20006c00c26a001800c44c63d8f41684d99aa569d93a9ca187d83734c8c4a519c4e9b163d8f416cfa62f77920d6383be12c91c71bd403599e1116ff486570012',
                            makingAmount: '57684207067582695',
                            takingAmount: '116032349855081688885',
                            allowedSender:
                                '0xa88800cd213da5ae406ce248380802bd53b47647'
                        }
                    },
                    {
                        orderHash:
                            '0xc359131e97c4cd1e01e1cd0ddeb16dd636c34fb294f53fd2f3e3ce8cb1c8482e',
                        signature:
                            '0x986c196d603d9c07faa1a5d3167a008a21850d5d9922da8a0f7e48225fdfd4a27f477d16f5078b5fad68205685a0a0dce40ac337a6f4376996e37f95e66a1a921b',
                        deadline: '2023-01-31T11:01:06.000Z',
                        auctionStartDate: '2023-01-31T10:58:11.000Z',
                        auctionEndDate: '2023-01-31T11:01:11.000Z',
                        order: {
                            salt: '45162296808160836322731793320280672051161012167252717657723413939965365979370',
                            maker: '0xe2b43fbd64f4bb4dc99a8d48ad41cfab90621567',
                            offsets:
                                '970558080243398695134547109586957793750899628853613079895592438595584',
                            receiver:
                                '0x0000000000000000000000000000000000000000',
                            makerAsset:
                                '0x2e85ae1c47602f7927bcabc2ff99c40aa222ae15',
                            takerAsset:
                                '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                            interactions:
                                '0x2cc2878d000063d8f4f2000000000000e2b43fbd64f4bb4dc99a8d48ad41cfab906215670000000084d99aa569d93a9ca187d83734c8c4a519c4e9b163d8f475cfa62f77920d6383be12c91c71bd403599e1116fffffffff10',
                            makingAmount: '470444951856649710700841',
                            takingAmount: '363417063831796476',
                            allowedSender:
                                '0xa88800cd213da5ae406ce248380802bd53b47647'
                        }
                    }
                ],
                meta: {
                    totalItems: 11,
                    currentPage: 1,
                    itemsPerPage: 2,
                    totalPages: 6
                }
            }
            const url = 'https://test.com'

            const httpProvider = createHttpProviderFake(expected)
            const sdk = new FusionSDK({
                url,
                network: NetworkEnum.ETHEREUM,
                httpProvider
            })

            const response = await sdk.getActiveOrders({page: 1, limit: 2})

            expect(response).toEqual(expected)
            expect(httpProvider.get).toHaveBeenLastCalledWith(
                `${url}/orders/v1.0/1/order/active/?page=1&limit=2`
            )
        })

        it('passes without providing args', async () => {
            const expected = {
                items: [
                    {
                        orderHash:
                            '0xe07193d683bb70f7c9a45001b863dd9058146849bdd47951b6d0ed13b1fd8396',
                        signature:
                            '0x21ef770f9bedbb97542033bd3b1a2ad611917567102545c93ce66668b8524b7c609bead7829113e104be41fbbd14fea027c85bc4668214b81d52f02c2f9010551b',
                        deadline: '2023-01-31T11:01:02.000Z',
                        auctionStartDate: '2023-01-31T10:58:02.000Z',
                        auctionEndDate: '2023-01-31T11:01:02.000Z',
                        order: {
                            salt: '45162296565521316310143660684688589556990590668045350709106347387233721386087',
                            maker: '0x84d99aa569d93a9ca187d83734c8c4a519c4e9b1',
                            offsets:
                                '2048955946929424286921227713067743020696385405755235979139736848564224',
                            receiver:
                                '0x08b067ad41e45babe5bbb52fc2fe7f692f628b06',
                            makerAsset:
                                '0xe68a2c0eef74b5d8d2975bbf7a681226e4d7473c',
                            takerAsset:
                                '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                            interactions:
                                '0x63592c2b0000000000000000000000000000000000000000000000000000000063d8f4ee08b067ad41e45babe5bbb52fc2fe7f692f628b06315b47a8c3780434b153667588db4ca628526e20006c00c26a001800c44c63d8f41684d99aa569d93a9ca187d83734c8c4a519c4e9b163d8f416cfa62f77920d6383be12c91c71bd403599e1116ff486570012',
                            makingAmount: '57684207067582695',
                            takingAmount: '116032349855081688885',
                            allowedSender:
                                '0xa88800cd213da5ae406ce248380802bd53b47647'
                        }
                    },
                    {
                        orderHash:
                            '0xc359131e97c4cd1e01e1cd0ddeb16dd636c34fb294f53fd2f3e3ce8cb1c8482e',
                        signature:
                            '0x986c196d603d9c07faa1a5d3167a008a21850d5d9922da8a0f7e48225fdfd4a27f477d16f5078b5fad68205685a0a0dce40ac337a6f4376996e37f95e66a1a921b',
                        deadline: '2023-01-31T11:01:06.000Z',
                        auctionStartDate: '2023-01-31T10:58:11.000Z',
                        auctionEndDate: '2023-01-31T11:01:11.000Z',
                        order: {
                            salt: '45162296808160836322731793320280672051161012167252717657723413939965365979370',
                            maker: '0xe2b43fbd64f4bb4dc99a8d48ad41cfab90621567',
                            offsets:
                                '970558080243398695134547109586957793750899628853613079895592438595584',
                            receiver:
                                '0x0000000000000000000000000000000000000000',
                            makerAsset:
                                '0x2e85ae1c47602f7927bcabc2ff99c40aa222ae15',
                            takerAsset:
                                '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                            interactions:
                                '0x2cc2878d000063d8f4f2000000000000e2b43fbd64f4bb4dc99a8d48ad41cfab906215670000000084d99aa569d93a9ca187d83734c8c4a519c4e9b163d8f475cfa62f77920d6383be12c91c71bd403599e1116fffffffff10',
                            makingAmount: '470444951856649710700841',
                            takingAmount: '363417063831796476',
                            allowedSender:
                                '0xa88800cd213da5ae406ce248380802bd53b47647'
                        }
                    }
                ],
                meta: {
                    totalItems: 11,
                    currentPage: 1,
                    itemsPerPage: 2,
                    totalPages: 6
                }
            }
            const url = 'https://test.com'

            const httpProvider = createHttpProviderFake(expected)
            const sdk = new FusionSDK({
                url,
                network: NetworkEnum.ETHEREUM,
                httpProvider
            })

            const response = await sdk.getActiveOrders()

            expect(response).toEqual(expected)
            expect(httpProvider.get).toHaveBeenLastCalledWith(
                `${url}/orders/v1.0/1/order/active/?`
            )
        })
    })

    describe('getOrderStatus', () => {
        it('success', async () => {
            const url = 'https://test.com'

            const expected = {
                order: {
                    salt: '45144194282371711345892930501725766861375817078109214409479816083205610767025',
                    maker: '0x6f250c769001617aff9bdf4b9fd878062e94af83',
                    offsets:
                        '970558080243398695134547109586957793750899628853613079895592438595584',
                    receiver: '0x0000000000000000000000000000000000000000',
                    makerAsset: '0x6eb15148d0ea88433dd8088a3acc515d27e36c1b',
                    takerAsset: '0xdac17f958d2ee523a2206206994597c13d831ec7',
                    interactions:
                        '0x2cc2878d000063ceb60f0000000000006f250c769001617aff9bdf4b9fd878062e94af83006c00c2fe001800c44c0000000084d99aa569d93a9ca187d83734c8c4a519c4e9b1ffffffff0a',
                    makingAmount: '2246481050155000',
                    takingAmount: '349837736598',
                    allowedSender: '0xa88800cd213da5ae406ce248380802bd53b47647'
                },
                cancelTx: null,
                points: null,
                auctionStartDate: 1674491231,
                auctionDuration: 180,
                initialRateBump: 50484,
                status: 'filled',
                createdAt: '2023-01-23T16:26:38.803Z',
                fromTokenToUsdPrice: '0.01546652159249409068',
                toTokenToUsdPrice: '1.00135361305236370022',
                fills: [
                    {
                        txHash: '0xcdd81e6860fc038d4fe8549efdf18488154667a2088d471cdaa7d492f24178a1',
                        filledMakerAmount: '2246481050155001',
                        filledAuctionTakerAmount: '351593117428'
                    }
                ],
                isNativeCurrency: false
            }
            const httpProvider = createHttpProviderFake(expected)
            const sdk = new FusionSDK({
                url,
                network: NetworkEnum.ETHEREUM,
                httpProvider
            })
            const orderHash = `0x1beee023ab933cf5446c298eadadb61c05705f2156ef5b2db36c160b36f31ce4`

            const response = await sdk.getOrderStatus({
                orderHash
            })

            expect(response).toEqual(expected)
            expect(httpProvider.get).toHaveBeenLastCalledWith(
                `${url}/orders/v1.0/1/order/status/${orderHash}`
            )
        })
    })
})
