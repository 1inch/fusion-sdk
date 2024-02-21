/* eslint-disable max-lines-per-function */
import {WebSocketApi} from './ws-api'
import {WebSocketServer, WebSocket} from 'ws'
import {
    GetActiveOrdersRpcEvent,
    OrderBalanceOrAllowanceChangeEvent,
    OrderCancelledEvent,
    OrderCreatedEvent,
    OrderEventType,
    OrderFilledEvent,
    OrderFilledPartiallyEvent,
    OrderInvalidEvent
} from './types'
import {NetworkEnum} from '../constants'
import {castUrl} from './url'
import {WebsocketClient} from '../connector'

jest.setTimeout(5 * 60 * 1000)

describe(__filename, () => {
    describe('base', () => {
        it('should be possible to subscribe to message', (done) => {
            const message = {id: 1}
            const {wss, url} = createWebsocketServerMock([message])

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                authKey: ''
            })

            wsSdk.onMessage((data) => {
                expect(data).toEqual(message)
                wsSdk.close()
                wss.close()
                done()
            })
        })

        it('should be possible to subscribe to open connection', (done) => {
            const message = {id: 1}
            const {wss, url} = createWebsocketServerMock([message])

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                authKey: ''
            })

            wsSdk.onOpen(() => {
                wsSdk.close()
                wss.close()
                done()
            })
        })

        it('this is pointed to underlying websocket', (done) => {
            const message = {id: 1}
            const {wss, url} = createWebsocketServerMock([message])

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                authKey: ''
            })

            wsSdk.on('open', function (this) {
                expect(this).toBeInstanceOf(WebSocket)
                this.close()
                wss.close()
                done()
            })
        })

        it('should be possible to subscribe to error', (done) => {
            const wsSdk = new WebSocketApi({
                url: 'ws://localhost:1234',
                network: NetworkEnum.ETHEREUM,
                authKey: ''
            })

            wsSdk.on('error', (error) => {
                expect(error.message).toContain('ECONNREFUSED')

                done()
            })
        })

        it('should be possible to initialize in lazy mode', (done) => {
            const message = {id: 1}
            const port = 8080

            const url = `ws://localhost:${port}/ws`
            const wss = new WebSocketServer({port, path: '/ws/v1.0/1'})

            wss.on('connection', (ws) => {
                for (const m of [message]) {
                    ws.send(JSON.stringify(m))
                }
            })

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                lazyInit: true,
                authKey: ''
            })

            expect(wsSdk.provider).toMatchObject({initialized: false})

            wsSdk.init()

            expect(wsSdk.provider).toMatchObject({initialized: true})

            wsSdk.onMessage((data) => {
                expect(data).toEqual(message)

                wsSdk.close()
                wss.close()
                done()
            })
        })

        it('should be safe to call methods on uninitialized ws', () => {
            const wsSdk = new WebSocketApi({
                url: 'random',
                network: NetworkEnum.ETHEREUM,
                lazyInit: true
            })

            expect(() => wsSdk.send({id: 1})).toThrowError()
        })

        it('should be possible to initialize not in lazy mode', (done) => {
            const message = {id: 1}
            const port = 8080

            const url = `ws://localhost:${port}/ws`
            const wss = new WebSocketServer({port, path: '/ws/v1.0/1'})

            wss.on('connection', (ws) => {
                for (const m of [message]) {
                    ws.send(JSON.stringify(m))
                }
            })

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                lazyInit: false
            })

            expect(wsSdk).toBeDefined()

            wsSdk.onMessage((data) => {
                expect(data).toEqual(message)

                wsSdk.close()
                wss.close()
                done()
            })
        })

        it('should be possible to pass provider instead of config', (done) => {
            const message = {id: 1}
            const port = 8080

            const url = `ws://localhost:${port}/ws`
            const wss = new WebSocketServer({port, path: '/ws/v1.0/1'})

            wss.on('connection', (ws) => {
                for (const m of [message]) {
                    ws.send(JSON.stringify(m))
                }
            })

            const castedUrl = castUrl(url)
            const urlWithNetwork = `${castedUrl}/v1.0/1`
            const provider = new WebsocketClient({url: urlWithNetwork})

            const wsSdk = new WebSocketApi(provider)

            expect(wsSdk.rpc).toBeDefined()
            expect(wsSdk.order).toBeDefined()

            expect(wsSdk).toBeDefined()

            wsSdk.onMessage((data) => {
                expect(data).toEqual(message)

                wsSdk.close()
                wss.close()
                done()
            })
        })

        it('should be possible to initialize with new method', (done) => {
            const message = {id: 1}
            const port = 8080

            const url = `ws://localhost:${port}/ws`
            const wss = new WebSocketServer({port, path: '/ws/v1.0/1'})

            wss.on('connection', (ws) => {
                for (const m of [message]) {
                    ws.send(JSON.stringify(m))
                }
            })

            const castedUrl = castUrl(url)
            const urlWithNetwork = `${castedUrl}/v1.0/1`
            const provider = new WebsocketClient({
                url: urlWithNetwork,
                authKey: ''
            })

            const wsSdk = WebSocketApi.new(provider)

            expect(wsSdk.rpc).toBeDefined()
            expect(wsSdk.order).toBeDefined()

            expect(wsSdk).toBeDefined()

            wsSdk.onMessage((data) => {
                expect(data).toEqual(message)

                wsSdk.close()
                wss.close()
                done()
            })
        })

        it('connection can be closed and you can listen to close event', (done) => {
            const message = {id: 1}
            const {wss, url} = createWebsocketServerMock([message])

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                authKey: ''
            })

            wsSdk.onClose(() => {
                wss.close()
                done()
            })

            wsSdk.onOpen(() => {
                wsSdk.close()
            })
        })
    })

    describe('rpc', () => {
        it('can ping pong ', (done) => {
            const response = {method: 'ping', result: 'pong'}
            const {url, wss} = createWebsocketRpcServerMock((ws, data) => {
                const parsedData = JSON.parse(data)

                if (parsedData.method === 'ping') {
                    ws.send(JSON.stringify(response))
                }
            })

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                authKey: ''
            })

            wsSdk.onOpen(() => {
                wsSdk.rpc.ping()
            })

            wsSdk.rpc.onPong((data) => {
                expect(data).toEqual(response.result)
                wsSdk.close()
                wss.close()
                done()
            })
        })

        it('can retrieve allowed rpc methods ', (done) => {
            const response = {
                method: 'getAllowedMethods',
                result: ['ping', 'getAllowedMethods']
            }
            const {url, wss} = createWebsocketRpcServerMock((ws, data) => {
                const parsedData = JSON.parse(data)

                if (parsedData.method === 'getAllowedMethods') {
                    ws.send(JSON.stringify(response))
                }
            })

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                authKey: ''
            })

            wsSdk.onOpen(() => {
                wsSdk.rpc.getAllowedMethods()
            })

            wsSdk.rpc.onGetAllowedMethods((data) => {
                expect(data).toEqual(response.result)
                wsSdk.close()
                wss.close()
                done()
            })
        })

        it('getActiveOrders success', (done) => {
            const response: GetActiveOrdersRpcEvent = {
                method: 'getActiveOrders',
                result: {
                    items: [],
                    meta: {
                        totalItems: 0,
                        totalPages: 0,
                        itemsPerPage: 0,
                        currentPage: 0
                    }
                }
            }
            const {url, wss} = createWebsocketRpcServerMock((ws, data) => {
                const parsedData = JSON.parse(data)

                if (parsedData.method === 'getActiveOrders') {
                    ws.send(JSON.stringify(response))
                }
            })

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                authKey: ''
            })

            wsSdk.onOpen(() => {
                wsSdk.rpc.getActiveOrders()
            })

            wsSdk.rpc.onGetActiveOrders((data) => {
                expect(data).toEqual(response.result)
                wsSdk.close()
                wss.close()
                done()
            })
        })

        it('getActiveOrders throws error', (done) => {
            const response: GetActiveOrdersRpcEvent = {
                method: 'getActiveOrders',
                result: {
                    items: [],
                    meta: {
                        totalItems: 0,
                        totalPages: 0,
                        itemsPerPage: 0,
                        currentPage: 0
                    }
                }
            }
            const {url, wss} = createWebsocketRpcServerMock((ws, data) => {
                const parsedData = JSON.parse(data)

                if (parsedData.method === 'getActiveOrders') {
                    ws.send(JSON.stringify(response))
                }
            })

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                authKey: ''
            })

            wsSdk.onOpen(() => {
                try {
                    wsSdk.rpc.getActiveOrders({page: -1})
                } catch (error) {
                    wsSdk.close()
                    wss.close()
                    done()
                }
            })
        })
    })

    describe('order', () => {
        it('can subscribe to order events', (done) => {
            const message1: OrderCreatedEvent = {
                event: 'order_created',
                result: {
                    quoteId: 'cf872857-c456-4f4f-aff0-84f7bebb7df2',
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4',
                    order: {
                        salt: '45144194282371711345892930501725766861375817078109214409479816083205610767025',
                        maker: '0x6f250c769001617aff9bdf4b9fd878062e94af83',
                        offsets:
                            '970558080243398695134547109586957793750899628853613079895592438595584',
                        receiver: '0x0000000000000000000000000000000000000000',
                        makerAsset:
                            '0x6eb15148d0ea88433dd8088a3acc515d27e36c1b',
                        takerAsset:
                            '0xdac17f958d2ee523a2206206994597c13d831ec7',
                        interactions:
                            '0x2cc2878d000063ceb60f0000000000006f250c769001617aff9bdf4b9fd878062e94af83006c00c2fe001800c44c0000000084d99aa569d93a9ca187d83734c8c4a519c4e9b1ffffffff0a',
                        makingAmount: '2246481050155000',
                        takingAmount: '349837736598',
                        allowedSender:
                            '0xa88800cd213da5ae406ce248380802bd53b47647'
                    },
                    signature:
                        '0x21ef770f9bedbb97542033bd3b1a2ad611917567102545c93ce66668b8524b7c609bead7829113e104be41fbbd14fea027c85bc4668214b81d52f02c2f9010551b',
                    deadline: '2023-01-31T11:01:02.000Z',
                    auctionStartDate: '2023-01-31T10:58:02.000Z',
                    auctionEndDate: '2023-01-31T11:01:02.000Z',
                    remainingMakerAmount: '57684207067582695'
                }
            }

            const message2: OrderInvalidEvent = {
                event: 'order_invalid',
                result: {
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4'
                }
            }

            const messages = [message1, message1, message2]
            const {url, wss} = createWebsocketServerMock(messages)

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                authKey: ''
            })

            const resArray: OrderEventType[] = []
            wsSdk.order.onOrder((data) => {
                resArray.push(data)
            })

            wsSdk.onMessage(() => {
                if (resArray.length === 3) {
                    expect(resArray).toEqual(messages)
                    wsSdk.close()
                    wss.close()
                    done()
                }
            })
        })

        it('can subscribe to order created events', (done) => {
            const message1: OrderCreatedEvent = {
                event: 'order_created',
                result: {
                    quoteId: 'cf872857-c456-4f4f-aff0-84f7bebb7df2',
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4',
                    order: {
                        salt: '45144194282371711345892930501725766861375817078109214409479816083205610767025',
                        maker: '0x6f250c769001617aff9bdf4b9fd878062e94af83',
                        offsets:
                            '970558080243398695134547109586957793750899628853613079895592438595584',
                        receiver: '0x0000000000000000000000000000000000000000',
                        makerAsset:
                            '0x6eb15148d0ea88433dd8088a3acc515d27e36c1b',
                        takerAsset:
                            '0xdac17f958d2ee523a2206206994597c13d831ec7',
                        interactions:
                            '0x2cc2878d000063ceb60f0000000000006f250c769001617aff9bdf4b9fd878062e94af83006c00c2fe001800c44c0000000084d99aa569d93a9ca187d83734c8c4a519c4e9b1ffffffff0a',
                        makingAmount: '2246481050155000',
                        takingAmount: '349837736598',
                        allowedSender:
                            '0xa88800cd213da5ae406ce248380802bd53b47647'
                    },
                    signature:
                        '0x21ef770f9bedbb97542033bd3b1a2ad611917567102545c93ce66668b8524b7c609bead7829113e104be41fbbd14fea027c85bc4668214b81d52f02c2f9010551b',
                    deadline: '2023-01-31T11:01:02.000Z',
                    auctionStartDate: '2023-01-31T10:58:02.000Z',
                    auctionEndDate: '2023-01-31T11:01:02.000Z',
                    remainingMakerAmount: '57684207067582695'
                }
            }

            const message2: OrderInvalidEvent = {
                event: 'order_invalid',
                result: {
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4'
                }
            }

            const messages = [message2, message1, message1]
            const expectedMessages = [message1, message1]
            const {url, wss} = createWebsocketServerMock(messages)

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                authKey: ''
            })

            const resArray: OrderEventType[] = []
            wsSdk.order.onOrderCreated((data) => {
                resArray.push(data)
            })

            wsSdk.onMessage(() => {
                if (resArray.length === 2) {
                    expect(resArray).toEqual(expectedMessages)
                    wsSdk.close()
                    wss.close()
                    done()
                }
            })
        })

        it('can subscribe to order invalid events', (done) => {
            const message1: OrderCreatedEvent = {
                event: 'order_created',
                result: {
                    quoteId: 'cf872857-c456-4f4f-aff0-84f7bebb7df2',
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4',
                    order: {
                        salt: '45144194282371711345892930501725766861375817078109214409479816083205610767025',
                        maker: '0x6f250c769001617aff9bdf4b9fd878062e94af83',
                        offsets:
                            '970558080243398695134547109586957793750899628853613079895592438595584',
                        receiver: '0x0000000000000000000000000000000000000000',
                        makerAsset:
                            '0x6eb15148d0ea88433dd8088a3acc515d27e36c1b',
                        takerAsset:
                            '0xdac17f958d2ee523a2206206994597c13d831ec7',
                        interactions:
                            '0x2cc2878d000063ceb60f0000000000006f250c769001617aff9bdf4b9fd878062e94af83006c00c2fe001800c44c0000000084d99aa569d93a9ca187d83734c8c4a519c4e9b1ffffffff0a',
                        makingAmount: '2246481050155000',
                        takingAmount: '349837736598',
                        allowedSender:
                            '0xa88800cd213da5ae406ce248380802bd53b47647'
                    },
                    signature:
                        '0x21ef770f9bedbb97542033bd3b1a2ad611917567102545c93ce66668b8524b7c609bead7829113e104be41fbbd14fea027c85bc4668214b81d52f02c2f9010551b',
                    deadline: '2023-01-31T11:01:02.000Z',
                    auctionStartDate: '2023-01-31T10:58:02.000Z',
                    auctionEndDate: '2023-01-31T11:01:02.000Z',
                    remainingMakerAmount: '57684207067582695'
                }
            }

            const message2: OrderInvalidEvent = {
                event: 'order_invalid',
                result: {
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4'
                }
            }

            const messages = [message1, message1, message2]
            const expectedMessages = [message2]
            const {url, wss} = createWebsocketServerMock(messages)

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                authKey: ''
            })

            const resArray: OrderEventType[] = []
            wsSdk.order.onOrderInvalid((data) => {
                resArray.push(data)
            })

            wsSdk.onMessage(() => {
                if (resArray.length === 1) {
                    expect(resArray).toEqual(expectedMessages)
                    wsSdk.close()
                    wss.close()
                    done()
                }
            })
        })

        it('can subscribe to order_balance_or_allowance_change events', (done) => {
            const message1: OrderCreatedEvent = {
                event: 'order_created',
                result: {
                    quoteId: 'cf872857-c456-4f4f-aff0-84f7bebb7df2',
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4',
                    order: {
                        salt: '45144194282371711345892930501725766861375817078109214409479816083205610767025',
                        maker: '0x6f250c769001617aff9bdf4b9fd878062e94af83',
                        offsets:
                            '970558080243398695134547109586957793750899628853613079895592438595584',
                        receiver: '0x0000000000000000000000000000000000000000',
                        makerAsset:
                            '0x6eb15148d0ea88433dd8088a3acc515d27e36c1b',
                        takerAsset:
                            '0xdac17f958d2ee523a2206206994597c13d831ec7',
                        interactions:
                            '0x2cc2878d000063ceb60f0000000000006f250c769001617aff9bdf4b9fd878062e94af83006c00c2fe001800c44c0000000084d99aa569d93a9ca187d83734c8c4a519c4e9b1ffffffff0a',
                        makingAmount: '2246481050155000',
                        takingAmount: '349837736598',
                        allowedSender:
                            '0xa88800cd213da5ae406ce248380802bd53b47647'
                    },
                    signature:
                        '0x21ef770f9bedbb97542033bd3b1a2ad611917567102545c93ce66668b8524b7c609bead7829113e104be41fbbd14fea027c85bc4668214b81d52f02c2f9010551b',
                    deadline: '2023-01-31T11:01:02.000Z',
                    auctionStartDate: '2023-01-31T10:58:02.000Z',
                    auctionEndDate: '2023-01-31T11:01:02.000Z',
                    remainingMakerAmount: '57684207067582695'
                }
            }

            const message2: OrderBalanceOrAllowanceChangeEvent = {
                event: 'order_balance_or_allowance_change',
                result: {
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4',
                    remainingMakerAmount: '57684207067582695',
                    balance: '57684207067582695',
                    allowance: '0'
                }
            }

            const messages = [message1, message1, message2]
            const expectedMessages = [message2]
            const {url, wss} = createWebsocketServerMock(messages)

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                authKey: ''
            })

            const resArray: OrderEventType[] = []
            wsSdk.order.onOrderBalanceOrAllowanceChange((data) => {
                resArray.push(data)
            })

            wsSdk.onMessage(() => {
                if (resArray.length === 1) {
                    expect(resArray).toEqual(expectedMessages)
                    wsSdk.close()
                    wss.close()
                    done()
                }
            })
        })

        it('can subscribe to order filled events', (done) => {
            const message1: OrderCreatedEvent = {
                event: 'order_created',
                result: {
                    quoteId: 'cf872857-c456-4f4f-aff0-84f7bebb7df2',
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4',
                    order: {
                        salt: '45144194282371711345892930501725766861375817078109214409479816083205610767025',
                        maker: '0x6f250c769001617aff9bdf4b9fd878062e94af83',
                        offsets:
                            '970558080243398695134547109586957793750899628853613079895592438595584',
                        receiver: '0x0000000000000000000000000000000000000000',
                        makerAsset:
                            '0x6eb15148d0ea88433dd8088a3acc515d27e36c1b',
                        takerAsset:
                            '0xdac17f958d2ee523a2206206994597c13d831ec7',
                        interactions:
                            '0x2cc2878d000063ceb60f0000000000006f250c769001617aff9bdf4b9fd878062e94af83006c00c2fe001800c44c0000000084d99aa569d93a9ca187d83734c8c4a519c4e9b1ffffffff0a',
                        makingAmount: '2246481050155000',
                        takingAmount: '349837736598',
                        allowedSender:
                            '0xa88800cd213da5ae406ce248380802bd53b47647'
                    },
                    signature:
                        '0x21ef770f9bedbb97542033bd3b1a2ad611917567102545c93ce66668b8524b7c609bead7829113e104be41fbbd14fea027c85bc4668214b81d52f02c2f9010551b',
                    deadline: '2023-01-31T11:01:02.000Z',
                    auctionStartDate: '2023-01-31T10:58:02.000Z',
                    auctionEndDate: '2023-01-31T11:01:02.000Z',
                    remainingMakerAmount: '57684207067582695'
                }
            }

            const message2: OrderFilledEvent = {
                event: 'order_filled',
                result: {
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4'
                }
            }

            const messages = [message1, message1, message2]
            const expectedMessages = [message2]
            const {url, wss} = createWebsocketServerMock(messages)

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                authKey: ''
            })

            const resArray: OrderEventType[] = []
            wsSdk.order.onOrderFilled((data) => {
                resArray.push(data)
            })

            wsSdk.onMessage(() => {
                if (resArray.length === 1) {
                    expect(resArray).toEqual(expectedMessages)
                    wsSdk.close()
                    wss.close()
                    done()
                }
            })
        })

        it('can subscribe to order filled partially events', (done) => {
            const message1: OrderCreatedEvent = {
                event: 'order_created',
                result: {
                    quoteId: 'cf872857-c456-4f4f-aff0-84f7bebb7df2',
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4',
                    order: {
                        salt: '45144194282371711345892930501725766861375817078109214409479816083205610767025',
                        maker: '0x6f250c769001617aff9bdf4b9fd878062e94af83',
                        offsets:
                            '970558080243398695134547109586957793750899628853613079895592438595584',
                        receiver: '0x0000000000000000000000000000000000000000',
                        makerAsset:
                            '0x6eb15148d0ea88433dd8088a3acc515d27e36c1b',
                        takerAsset:
                            '0xdac17f958d2ee523a2206206994597c13d831ec7',
                        interactions:
                            '0x2cc2878d000063ceb60f0000000000006f250c769001617aff9bdf4b9fd878062e94af83006c00c2fe001800c44c0000000084d99aa569d93a9ca187d83734c8c4a519c4e9b1ffffffff0a',
                        makingAmount: '2246481050155000',
                        takingAmount: '349837736598',
                        allowedSender:
                            '0xa88800cd213da5ae406ce248380802bd53b47647'
                    },
                    signature:
                        '0x21ef770f9bedbb97542033bd3b1a2ad611917567102545c93ce66668b8524b7c609bead7829113e104be41fbbd14fea027c85bc4668214b81d52f02c2f9010551b',
                    deadline: '2023-01-31T11:01:02.000Z',
                    auctionStartDate: '2023-01-31T10:58:02.000Z',
                    auctionEndDate: '2023-01-31T11:01:02.000Z',
                    remainingMakerAmount: '57684207067582695'
                }
            }

            const message2: OrderFilledPartiallyEvent = {
                event: 'order_filled_partially',
                result: {
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4',
                    remainingMakerAmount: '57684207067582695'
                }
            }

            const messages = [message1, message1, message2]
            const expectedMessages = [message2]
            const {url, wss} = createWebsocketServerMock(messages)

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                authKey: ''
            })

            const resArray: OrderEventType[] = []
            wsSdk.order.onOrderFilledPartially((data) => {
                resArray.push(data)
            })

            wsSdk.onMessage(() => {
                if (resArray.length === 1) {
                    expect(resArray).toEqual(expectedMessages)
                    wsSdk.close()
                    wss.close()
                    done()
                }
            })
        })

        it('can subscribe to order cancelled events', (done) => {
            const message1: OrderCreatedEvent = {
                event: 'order_created',
                result: {
                    quoteId: 'cf872857-c456-4f4f-aff0-84f7bebb7df2',
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4',
                    order: {
                        salt: '45144194282371711345892930501725766861375817078109214409479816083205610767025',
                        maker: '0x6f250c769001617aff9bdf4b9fd878062e94af83',
                        offsets:
                            '970558080243398695134547109586957793750899628853613079895592438595584',
                        receiver: '0x0000000000000000000000000000000000000000',
                        makerAsset:
                            '0x6eb15148d0ea88433dd8088a3acc515d27e36c1b',
                        takerAsset:
                            '0xdac17f958d2ee523a2206206994597c13d831ec7',
                        interactions:
                            '0x2cc2878d000063ceb60f0000000000006f250c769001617aff9bdf4b9fd878062e94af83006c00c2fe001800c44c0000000084d99aa569d93a9ca187d83734c8c4a519c4e9b1ffffffff0a',
                        makingAmount: '2246481050155000',
                        takingAmount: '349837736598',
                        allowedSender:
                            '0xa88800cd213da5ae406ce248380802bd53b47647'
                    },
                    signature:
                        '0x21ef770f9bedbb97542033bd3b1a2ad611917567102545c93ce66668b8524b7c609bead7829113e104be41fbbd14fea027c85bc4668214b81d52f02c2f9010551b',
                    deadline: '2023-01-31T11:01:02.000Z',
                    auctionStartDate: '2023-01-31T10:58:02.000Z',
                    auctionEndDate: '2023-01-31T11:01:02.000Z',
                    remainingMakerAmount: '57684207067582695'
                }
            }

            const message2: OrderCancelledEvent = {
                event: 'order_cancelled',
                result: {
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4'
                }
            }

            const messages = [message1, message1, message2]
            const expectedMessages = [message2]
            const {url, wss} = createWebsocketServerMock(messages)

            const wsSdk = new WebSocketApi({
                url,
                network: NetworkEnum.ETHEREUM,
                authKey: ''
            })

            const resArray: OrderEventType[] = []
            wsSdk.order.onOrderCancelled((data) => {
                resArray.push(data)
            })

            wsSdk.onMessage(() => {
                if (resArray.length === 1) {
                    expect(resArray).toEqual(expectedMessages)
                    wsSdk.close()
                    wss.close()
                    done()
                }
            })
        })
    })
})

function createWebsocketRpcServerMock(cb: (ws: WebSocket, data: any) => void): {
    url: string
    wss: WebSocketServer
} {
    const port = 8080
    const returnUrl = `ws://localhost:${port}/ws`
    const wss = new WebSocketServer({port, path: '/ws/v1.0/1'})

    wss.on('connection', (ws) => {
        ws.on('message', (data) => cb(ws, data))
    })

    return {url: returnUrl, wss}
}

function createWebsocketServerMock(messages: any[]): {
    url: string
    wss: WebSocketServer
} {
    const port = 8080

    const returnUrl = `ws://localhost:${port}/ws`
    const wss = new WebSocketServer({port, path: '/ws/v1.0/1'})

    wss.on('connection', (ws) => {
        for (const message of messages) {
            ws.send(JSON.stringify(message))
        }
    })

    return {url: returnUrl, wss}
}
