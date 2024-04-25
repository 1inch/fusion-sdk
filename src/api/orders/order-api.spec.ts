/* eslint-disable max-lines-per-function */
import {instance, mock} from 'ts-mockito'
import {
    ActiveOrdersResponse,
    OrdersByMakerResponse,
    OrderStatus,
    OrderStatusResponse
} from './types'
import {
    HttpProviderConnector,
    Web3Like,
    Web3ProviderConnector
} from '../../connector'
import {NetworkEnum} from '../../constants'
import {FusionSDK} from '../../sdk'

function createHttpProviderFake<T>(mock: T): HttpProviderConnector {
    return {
        get: jest.fn().mockImplementationOnce(() => {
            return Promise.resolve(mock)
        }),
        post: jest.fn().mockImplementation(() => {
            return Promise.resolve(null)
        })
    }
}

describe(__filename, () => {
    let web3Provider: Web3Like
    let web3ProviderConnector: Web3ProviderConnector

    beforeEach(() => {
        web3Provider = mock<Web3Like>()
        web3ProviderConnector = new Web3ProviderConnector(
            instance(web3Provider)
        )
    })

    describe('getActiveOrders', () => {
        it('success', async () => {
            const expected: ActiveOrdersResponse = {
                items: [
                    {
                        quoteId: '6f3dc6f8-33d3-478b-9f70-2f7c2becc488',
                        orderHash:
                            '0x496755a88564d8ded6759dff0252d3e6c3ef1fe42b4fa1bbc3f03bd2674f1078',
                        signature:
                            '0xb6ffc4f4f8500b5f49d2d01bc83efa5750b10f242db3f10f09df51df1fafe6604b35342a2aadc9f10ad14cbaaad9844689a5386c860c31212be3452601eb71de1c',
                        deadline: '2024-04-25T13:27:48.000Z',
                        auctionStartDate: '2024-04-25T13:24:36.000Z',
                        auctionEndDate: '2024-04-25T13:27:36.000Z',
                        remainingMakerAmount: '33058558528525703',
                        order: {
                            salt: '102412815596156525137376967412477025111761562902072504909418068904100646989168',
                            maker: '0xe2668d9bef0a686c9874882f7037758b5b520e5c',
                            receiver:
                                '0x0000000000000000000000000000000000000000',
                            makerAsset:
                                '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                            takerAsset:
                                '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
                            makerTraits:
                                '62419173104490761595518734107493289545375808488163256166876037723686174720000',
                            makingAmount: '33058558528525703',
                            takingAmount: '147681'
                        },
                        extension:
                            '0x000000830000005e0000005e0000005e0000005e0000002f0000000000000000fb2809a5314473e1165f6b58018e20ed8f07b8400c956a00003e1b662a59940000b40ecaaa002b1d00540e41ea003cfb2809a5314473e1165f6b58018e20ed8f07b8400c956a00003e1b662a59940000b40ecaaa002b1d00540e41ea003cfb2809a5314473e1165f6b58018e20ed8f07b840662a597cd1a23c3abeed63c51b86000008'
                    },
                    {
                        quoteId: '8343588a-da1e-407f-b41f-aa86f0ec4266',
                        orderHash:
                            '0x153386fa8e0b27b09d1250455521531e392e342571de31ac50836a3b6b9001d8',
                        signature:
                            '0x9ef06d325568887caace5f82bba23c821224df23886675fdd63259ee1594269e2768f58fe90a0ae6009184f2f422eb61e9cbd4f6d3c674befd0e55302995d4301c',
                        deadline: '2023-01-31T11:01:06.000Z',
                        auctionStartDate: '2023-01-31T10:58:11.000Z',
                        auctionEndDate: '2023-01-31T11:01:11.000Z',
                        remainingMakerAmount: '470444951856649710700841',
                        order: {
                            salt: '102412815605188492728297784997818915205705878873010401762040598952855113412064',
                            maker: '0xdc8152a435d76fc89ced8255e28f690962c27e52',
                            receiver:
                                '0x0000000000000000000000000000000000000000',
                            makerAsset:
                                '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                            takerAsset:
                                '0xdac17f958d2ee523a2206206994597c13d831ec7',
                            makerTraits:
                                '62419173104490761595518734107503940736863610329190665072877236599067968012288',
                            makingAmount: '30000000',
                            takingAmount: '20653338'
                        },
                        extension:
                            '0x00000079000000540000005400000054000000540000002a0000000000000000fb2809a5314473e1165f6b58018e20ed8f07b840423b06000034016627b1dc0000b444e602447208003cfb2809a5314473e1165f6b58018e20ed8f07b840423b06000034016627b1dc0000b444e602447208003cfb2809a5314473e1165f6b58018e20ed8f07b8406627b1c4d1a23c3abeed63c51b86000008'
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
                httpProvider,
                blockchainProvider: web3ProviderConnector
            })

            const response = await sdk.getActiveOrders({page: 1, limit: 2})

            expect(response).toEqual(expected)
            expect(httpProvider.get).toHaveBeenLastCalledWith(
                `${url}/orders/v2.0/1/order/active/?page=1&limit=2`
            )
        })

        it('passes without providing args', async () => {
            const expected = {
                items: [
                    {
                        quoteId: '6f3dc6f8-33d3-478b-9f70-2f7c2becc488',
                        orderHash:
                            '0x496755a88564d8ded6759dff0252d3e6c3ef1fe42b4fa1bbc3f03bd2674f1078',
                        signature:
                            '0xb6ffc4f4f8500b5f49d2d01bc83efa5750b10f242db3f10f09df51df1fafe6604b35342a2aadc9f10ad14cbaaad9844689a5386c860c31212be3452601eb71de1c',
                        deadline: '2024-04-25T13:27:48.000Z',
                        auctionStartDate: '2024-04-25T13:24:36.000Z',
                        auctionEndDate: '2024-04-25T13:27:36.000Z',
                        remainingMakerAmount: '33058558528525703',
                        order: {
                            salt: '102412815596156525137376967412477025111761562902072504909418068904100646989168',
                            maker: '0xe2668d9bef0a686c9874882f7037758b5b520e5c',
                            receiver:
                                '0x0000000000000000000000000000000000000000',
                            makerAsset:
                                '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                            takerAsset:
                                '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
                            makerTraits:
                                '62419173104490761595518734107493289545375808488163256166876037723686174720000',
                            makingAmount: '33058558528525703',
                            takingAmount: '147681'
                        },
                        extension:
                            '0x000000830000005e0000005e0000005e0000005e0000002f0000000000000000fb2809a5314473e1165f6b58018e20ed8f07b8400c956a00003e1b662a59940000b40ecaaa002b1d00540e41ea003cfb2809a5314473e1165f6b58018e20ed8f07b8400c956a00003e1b662a59940000b40ecaaa002b1d00540e41ea003cfb2809a5314473e1165f6b58018e20ed8f07b840662a597cd1a23c3abeed63c51b86000008'
                    },
                    {
                        quoteId: '8343588a-da1e-407f-b41f-aa86f0ec4266',
                        orderHash:
                            '0x153386fa8e0b27b09d1250455521531e392e342571de31ac50836a3b6b9001d8',
                        signature:
                            '0x9ef06d325568887caace5f82bba23c821224df23886675fdd63259ee1594269e2768f58fe90a0ae6009184f2f422eb61e9cbd4f6d3c674befd0e55302995d4301c',
                        deadline: '2023-01-31T11:01:06.000Z',
                        auctionStartDate: '2023-01-31T10:58:11.000Z',
                        auctionEndDate: '2023-01-31T11:01:11.000Z',
                        remainingMakerAmount: '470444951856649710700841',
                        order: {
                            salt: '102412815605188492728297784997818915205705878873010401762040598952855113412064',
                            maker: '0xdc8152a435d76fc89ced8255e28f690962c27e52',
                            receiver:
                                '0x0000000000000000000000000000000000000000',
                            makerAsset:
                                '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                            takerAsset:
                                '0xdac17f958d2ee523a2206206994597c13d831ec7',
                            makerTraits:
                                '62419173104490761595518734107503940736863610329190665072877236599067968012288',
                            makingAmount: '30000000',
                            takingAmount: '20653338'
                        },
                        extension:
                            '0x00000079000000540000005400000054000000540000002a0000000000000000fb2809a5314473e1165f6b58018e20ed8f07b840423b06000034016627b1dc0000b444e602447208003cfb2809a5314473e1165f6b58018e20ed8f07b840423b06000034016627b1dc0000b444e602447208003cfb2809a5314473e1165f6b58018e20ed8f07b8406627b1c4d1a23c3abeed63c51b86000008'
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
                httpProvider,
                blockchainProvider: web3ProviderConnector
            })

            const response = await sdk.getActiveOrders()

            expect(response).toEqual(expected)
            expect(httpProvider.get).toHaveBeenLastCalledWith(
                `${url}/orders/v2.0/1/order/active/?`
            )
        })
    })

    describe('getOrderStatus', () => {
        it('success', async () => {
            const url = 'https://test.com'

            const expected: OrderStatusResponse = {
                order: {
                    salt: '102412815611787935992271873344279698181002251432500613888978521074851540062603',
                    maker: '0xdc8152a435d76fc89ced8255e28f690962c27e52',
                    receiver: '0x0000000000000000000000000000000000000000',
                    makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                    takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                    makerTraits:
                        '33471150795161712739625987854073848363835857014350031386507831725384548745216',
                    makingAmount: '40000000000000000',
                    takingAmount: '119048031'
                },
                cancelTx: null,
                points: null,
                auctionStartDate: 1713866825,
                auctionDuration: 360,
                initialRateBump: 654927,
                status: OrderStatus.Filled,
                extension:
                    '0x0000006f0000004a0000004a0000004a0000004a000000250000000000000000fb2809a5314473e1165f6b58018e20ed8f07b840000000000000006627884900016809fe4ffb2809a5314473e1165f6b58018e20ed8f07b840000000000000006627884900016809fe4ffb2809a5314473e1165f6b58018e20ed8f07b8406627883dd1a23c3abeed63c51b86000008',
                createdAt: '2024-04-23T10:06:58.807Z',
                fromTokenToUsdPrice: '3164.81348508000019137398',
                toTokenToUsdPrice: '0.99699437304091353962',
                fills: [
                    {
                        txHash: '0x346d2098059da884c61dfb95c357f11abbf51466c7903fe9c0d5a3d8471b8549',
                        filledMakerAmount: '40000000000000000',
                        filledAuctionTakerAmount: '120997216'
                    }
                ],
                isNativeCurrency: false
            }
            const httpProvider = createHttpProviderFake(expected)
            const sdk = new FusionSDK({
                url,
                network: NetworkEnum.ETHEREUM,
                httpProvider,
                blockchainProvider: web3ProviderConnector
            })
            const orderHash = `0x1beee023ab933cf5446c298eadadb61c05705f2156ef5b2db36c160b36f31ce4`

            const response = await sdk.getOrderStatus(orderHash)

            expect(response).toEqual(expected)
            expect(httpProvider.get).toHaveBeenLastCalledWith(
                `${url}/orders/v2.0/1/order/status/${orderHash}`
            )
        })

        it('throws an error when the string is not hexadecimal', async () => {
            const url = 'https://test.com'

            const expected: OrderStatusResponse = {
                order: {
                    salt: '102412815611787935992271873344279698181002251432500613888978521074851540062603',
                    maker: '0xdc8152a435d76fc89ced8255e28f690962c27e52',
                    receiver: '0x0000000000000000000000000000000000000000',
                    makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                    takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                    makerTraits:
                        '33471150795161712739625987854073848363835857014350031386507831725384548745216',
                    makingAmount: '40000000000000000',
                    takingAmount: '119048031'
                },
                cancelTx: null,
                points: null,
                auctionStartDate: 1713866825,
                auctionDuration: 360,
                initialRateBump: 654927,
                status: OrderStatus.Filled,
                extension:
                    '0x0000006f0000004a0000004a0000004a0000004a000000250000000000000000fb2809a5314473e1165f6b58018e20ed8f07b840000000000000006627884900016809fe4ffb2809a5314473e1165f6b58018e20ed8f07b840000000000000006627884900016809fe4ffb2809a5314473e1165f6b58018e20ed8f07b8406627883dd1a23c3abeed63c51b86000008',
                createdAt: '2024-04-23T10:06:58.807Z',
                fromTokenToUsdPrice: '3164.81348508000019137398',
                toTokenToUsdPrice: '0.99699437304091353962',
                fills: [
                    {
                        txHash: '0x346d2098059da884c61dfb95c357f11abbf51466c7903fe9c0d5a3d8471b8549',
                        filledMakerAmount: '40000000000000000',
                        filledAuctionTakerAmount: '120997216'
                    }
                ],
                isNativeCurrency: false
            }
            const httpProvider = createHttpProviderFake(expected)
            const sdk = new FusionSDK({
                url,
                network: NetworkEnum.ETHEREUM,
                httpProvider,
                blockchainProvider: web3ProviderConnector
            })
            const orderHash = `0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4`

            const promise = sdk.getOrderStatus(orderHash)

            await expect(promise).rejects.toThrow(/orderHash have to be hex/)
        })

        it('throws an error when the string length is not equals 66', async () => {
            const url = 'https://test.com'

            const expected: OrderStatusResponse = {
                order: {
                    salt: '102412815611787935992271873344279698181002251432500613888978521074851540062603',
                    maker: '0xdc8152a435d76fc89ced8255e28f690962c27e52',
                    receiver: '0x0000000000000000000000000000000000000000',
                    makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                    takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                    makerTraits:
                        '33471150795161712739625987854073848363835857014350031386507831725384548745216',
                    makingAmount: '40000000000000000',
                    takingAmount: '119048031'
                },
                cancelTx: null,
                points: null,
                auctionStartDate: 1713866825,
                auctionDuration: 360,
                initialRateBump: 654927,
                status: OrderStatus.Filled,
                extension:
                    '0x0000006f0000004a0000004a0000004a0000004a000000250000000000000000fb2809a5314473e1165f6b58018e20ed8f07b840000000000000006627884900016809fe4ffb2809a5314473e1165f6b58018e20ed8f07b840000000000000006627884900016809fe4ffb2809a5314473e1165f6b58018e20ed8f07b8406627883dd1a23c3abeed63c51b86000008',
                createdAt: '2024-04-23T10:06:58.807Z',
                fromTokenToUsdPrice: '3164.81348508000019137398',
                toTokenToUsdPrice: '0.99699437304091353962',
                fills: [
                    {
                        txHash: '0x346d2098059da884c61dfb95c357f11abbf51466c7903fe9c0d5a3d8471b8549',
                        filledMakerAmount: '40000000000000000',
                        filledAuctionTakerAmount: '120997216'
                    }
                ],
                isNativeCurrency: false
            }
            const httpProvider = createHttpProviderFake(expected)
            const sdk = new FusionSDK({
                url,
                network: NetworkEnum.ETHEREUM,
                httpProvider,
                blockchainProvider: web3ProviderConnector
            })
            const orderHash = `0x1beee023ab933cf5446c298eadasdasdb61c0x5705f2156ef5b2db36c160b36f31ce4`

            const promise = sdk.getOrderStatus(orderHash)

            await expect(promise).rejects.toThrow(
                /orderHash length should be equals 66/
            )
        })
    })

    describe('getOrdersByMaker', () => {
        it('success', async () => {
            const url = 'https://test.com'

            const expected: OrdersByMakerResponse = {
                meta: {
                    totalItems: 2,
                    currentPage: 1,
                    itemsPerPage: 100,
                    totalPages: 1
                },
                items: [
                    {
                        orderHash:
                            '0x32b666e75a34bd97844017747a3222b0422b5bbce15f1c06913678fcbff84571',
                        makerAsset:
                            '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                        takerAsset:
                            '0xdac17f958d2ee523a2206206994597c13d831ec7',
                        makerAmount: '30000000',
                        minTakerAmount: '23374478',
                        createdAt: '2024-04-23T11:36:45.980Z',
                        fills: [],
                        status: OrderStatus.Pending,
                        cancelTx: null,
                        isNativeCurrency: false,
                        auctionStartDate: 1713872226,
                        auctionDuration: 180,
                        initialRateBump: 2824245,
                        points: [
                            {
                                coefficient: 2805816,
                                delay: 60
                            }
                        ]
                    },
                    {
                        orderHash:
                            '0x726c96911b867c84880fcacbd4e26205ecee58be72b31e2969987880b53f35f2',
                        makerAsset:
                            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                        takerAsset:
                            '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                        makerAmount: '40000000000000000',
                        minTakerAmount: '119048031',
                        createdAt: '2024-04-23T10:06:58.807Z',
                        fills: [
                            {
                                txHash: '0x346d2098059da884c61dfb95c357f11abbf51466c7903fe9c0d5a3d8471b8549',
                                filledMakerAmount: '40000000000000000',
                                filledAuctionTakerAmount: '120997216'
                            }
                        ],
                        status: OrderStatus.Filled,
                        cancelTx: null,
                        isNativeCurrency: false,
                        auctionStartDate: 1713866825,
                        auctionDuration: 360,
                        initialRateBump: 654927,
                        points: null
                    }
                ]
            }
            const httpProvider = createHttpProviderFake(expected)
            const sdk = new FusionSDK({
                url,
                network: NetworkEnum.ETHEREUM,
                httpProvider,
                blockchainProvider: web3ProviderConnector
            })

            const address = '0xfa80cd9b3becc0b4403b0f421384724f2810775f'
            const response = await sdk.getOrdersByMaker({
                address,
                limit: 1,
                page: 1
            })

            expect(response).toEqual(expected)
            expect(httpProvider.get).toHaveBeenLastCalledWith(
                `${url}/orders/v2.0/1/order/maker/${address}/?limit=1&page=1`
            )
        })

        it('handles the case when no pagination params was passed', async () => {
            const url = 'https://test.com'

            const expected: OrdersByMakerResponse = {
                meta: {
                    totalItems: 2,
                    currentPage: 1,
                    itemsPerPage: 100,
                    totalPages: 1
                },
                items: [
                    {
                        orderHash:
                            '0x32b666e75a34bd97844017747a3222b0422b5bbce15f1c06913678fcbff84571',
                        makerAsset:
                            '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                        takerAsset:
                            '0xdac17f958d2ee523a2206206994597c13d831ec7',
                        makerAmount: '30000000',
                        minTakerAmount: '23374478',
                        createdAt: '2024-04-23T11:36:45.980Z',
                        fills: [],
                        status: OrderStatus.Pending,
                        cancelTx: null,
                        isNativeCurrency: false,
                        auctionStartDate: 1713872226,
                        auctionDuration: 180,
                        initialRateBump: 2824245,
                        points: [
                            {
                                coefficient: 2805816,
                                delay: 60
                            }
                        ]
                    },
                    {
                        orderHash:
                            '0x726c96911b867c84880fcacbd4e26205ecee58be72b31e2969987880b53f35f2',
                        makerAsset:
                            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                        takerAsset:
                            '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                        makerAmount: '40000000000000000',
                        minTakerAmount: '119048031',
                        createdAt: '2024-04-23T10:06:58.807Z',
                        fills: [
                            {
                                txHash: '0x346d2098059da884c61dfb95c357f11abbf51466c7903fe9c0d5a3d8471b8549',
                                filledMakerAmount: '40000000000000000',
                                filledAuctionTakerAmount: '120997216'
                            }
                        ],
                        status: OrderStatus.Filled,
                        cancelTx: null,
                        isNativeCurrency: false,
                        auctionStartDate: 1713866825,
                        auctionDuration: 360,
                        initialRateBump: 654927,
                        points: null
                    }
                ]
            }

            const httpProvider = createHttpProviderFake(expected)
            const sdk = new FusionSDK({
                url,
                network: NetworkEnum.ETHEREUM,
                httpProvider,
                blockchainProvider: web3ProviderConnector
            })

            const address = '0xfa80cd9b3becc0b4403b0f421384724f2810775f'
            const response = await sdk.getOrdersByMaker({
                address
            })

            expect(response).toEqual(expected)
            expect(httpProvider.get).toHaveBeenLastCalledWith(
                `${url}/orders/v2.0/1/order/maker/${address}/?`
            )
        })

        it('throws an error with invalid address', async () => {
            const url = 'https://test.com'

            const expected: OrdersByMakerResponse = {
                meta: {
                    totalItems: 2,
                    currentPage: 1,
                    itemsPerPage: 100,
                    totalPages: 1
                },
                items: [
                    {
                        orderHash:
                            '0x32b666e75a34bd97844017747a3222b0422b5bbce15f1c06913678fcbff84571',
                        makerAsset:
                            '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                        takerAsset:
                            '0xdac17f958d2ee523a2206206994597c13d831ec7',
                        makerAmount: '30000000',
                        minTakerAmount: '23374478',
                        createdAt: '2024-04-23T11:36:45.980Z',
                        fills: [],
                        status: OrderStatus.Pending,
                        cancelTx: null,
                        isNativeCurrency: false,
                        auctionStartDate: 1713872226,
                        auctionDuration: 180,
                        initialRateBump: 2824245,
                        points: [
                            {
                                coefficient: 2805816,
                                delay: 60
                            }
                        ]
                    },
                    {
                        orderHash:
                            '0x726c96911b867c84880fcacbd4e26205ecee58be72b31e2969987880b53f35f2',
                        makerAsset:
                            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                        takerAsset:
                            '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                        makerAmount: '40000000000000000',
                        minTakerAmount: '119048031',
                        createdAt: '2024-04-23T10:06:58.807Z',
                        fills: [
                            {
                                txHash: '0x346d2098059da884c61dfb95c357f11abbf51466c7903fe9c0d5a3d8471b8549',
                                filledMakerAmount: '40000000000000000',
                                filledAuctionTakerAmount: '120997216'
                            }
                        ],
                        status: OrderStatus.Filled,
                        cancelTx: null,
                        isNativeCurrency: false,
                        auctionStartDate: 1713866825,
                        auctionDuration: 360,
                        initialRateBump: 654927,
                        points: null
                    }
                ]
            }

            const httpProvider = createHttpProviderFake(expected)
            const sdk = new FusionSDK({
                url,
                network: NetworkEnum.ETHEREUM,
                httpProvider,
                blockchainProvider: web3ProviderConnector
            })

            const address =
                '0xfa80cd9b3becc0b4403b0f42138472ewewewewewewew2810775f'
            const promise = sdk.getOrdersByMaker({
                address,
                limit: 1,
                page: 1
            })

            await expect(promise).rejects.toThrow(/is invalid address/)
        })
    })
})
