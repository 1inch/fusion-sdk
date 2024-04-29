/* eslint-disable max-lines-per-function */
import {WebSocketServer, WebSocket} from 'ws'
import {WebSocketApi} from './ws-api'
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
import {castUrl} from './url'
import {NetworkEnum} from '../constants'
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
            const wss = new WebSocketServer({port, path: '/ws/v2.0/1'})

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
            const wss = new WebSocketServer({port, path: '/ws/v2.0/1'})

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
            const wss = new WebSocketServer({port, path: '/ws/v2.0/1'})

            wss.on('connection', (ws) => {
                for (const m of [message]) {
                    ws.send(JSON.stringify(m))
                }
            })

            const castedUrl = castUrl(url)
            const urlWithNetwork = `${castedUrl}/v2.0/1`
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
            const wss = new WebSocketServer({port, path: '/ws/v2.0/1'})

            wss.on('connection', (ws) => {
                for (const m of [message]) {
                    ws.send(JSON.stringify(m))
                }
            })

            const castedUrl = castUrl(url)
            const urlWithNetwork = `${castedUrl}/v2.0/1`
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
                    quoteId: 'b77da8b7-a4bb-4563-b917-03522aa609e3',
                    orderHash:
                        '0xb9522c23c8667c5e76bf0b855ffabbaebca282f8e396d788c2df75e91a0391d2-5705f2156ef5b2db36c160b36f31ce4',
                    order: {
                        salt: '9445680545936410419330284706951757224702878670220689583677680607556412140293',
                        maker: '0x6edc317f3208b10c46f4ff97faa04dd632487408',
                        receiver: '0x0000000000000000000000000000000000000000',
                        makerAsset:
                            '0x6b175474e89094c44da98b954eedeac495271d0f',
                        takerAsset:
                            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                        makerTraits:
                            '62419173104490761595518734106557662061518414611782227068396304425790442831872',
                        makingAmount: '30000000000000000000',
                        takingAmount: '7516665910385115'
                    },
                    signature:
                        '0xb51731d6e62754ae75d11d13983c19b25fcc1a43fc327710a26ae291fde3d33f52dee7a4c0154256f6bb272260170128242034a89f44e7e887d1bb54a746a5941b',
                    deadline: '2024-04-29T15:27:39.000Z',
                    auctionStartDate: '2024-04-29T15:17:27.000Z',
                    auctionEndDate: '2024-04-29T15:27:27.000Z',
                    remainingMakerAmount: '30000000000000000000',
                    extension:
                        '0x000000cb0000005e0000005e0000005e0000005e0000002f0000000000000000fb2809a5314473e1165f6b58018e20ed8f07b84000000000000000662fba0700025829a7fd01ec57001827bba60018fb2809a5314473e1165f6b58018e20ed8f07b84000000000000000662fba0700025829a7fd01ec57001827bba60018fb2809a5314473e1165f6b58018e20ed8f07b840662fb9efb09498030ae3416b66dc00007bf29735c20c566e5a0c0000950fa635aec75b30781a0000d18bd45f0b94f54a968f000076d49414ad2b8371a4220000a59ca88d5813e693528f000038700d5181a674fdb9a2000038'
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
                    quoteId: 'b77da8b7-a4bb-4563-b917-03522aa609e3',
                    orderHash:
                        '0xb9522c23c8667c5e76bf0b855ffabbaebca282f8e396d788c2df75e91a0391d2-5705f2156ef5b2db36c160b36f31ce4',
                    order: {
                        salt: '9445680545936410419330284706951757224702878670220689583677680607556412140293',
                        maker: '0x6edc317f3208b10c46f4ff97faa04dd632487408',
                        receiver: '0x0000000000000000000000000000000000000000',
                        makerAsset:
                            '0x6b175474e89094c44da98b954eedeac495271d0f',
                        takerAsset:
                            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                        makerTraits:
                            '62419173104490761595518734106557662061518414611782227068396304425790442831872',
                        makingAmount: '30000000000000000000',
                        takingAmount: '7516665910385115'
                    },
                    signature:
                        '0xb51731d6e62754ae75d11d13983c19b25fcc1a43fc327710a26ae291fde3d33f52dee7a4c0154256f6bb272260170128242034a89f44e7e887d1bb54a746a5941b',
                    deadline: '2024-04-29T15:27:39.000Z',
                    auctionStartDate: '2024-04-29T15:17:27.000Z',
                    auctionEndDate: '2024-04-29T15:27:27.000Z',
                    remainingMakerAmount: '30000000000000000000',
                    extension:
                        '0x000000cb0000005e0000005e0000005e0000005e0000002f0000000000000000fb2809a5314473e1165f6b58018e20ed8f07b84000000000000000662fba0700025829a7fd01ec57001827bba60018fb2809a5314473e1165f6b58018e20ed8f07b84000000000000000662fba0700025829a7fd01ec57001827bba60018fb2809a5314473e1165f6b58018e20ed8f07b840662fb9efb09498030ae3416b66dc00007bf29735c20c566e5a0c0000950fa635aec75b30781a0000d18bd45f0b94f54a968f000076d49414ad2b8371a4220000a59ca88d5813e693528f000038700d5181a674fdb9a2000038'
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
                    quoteId: 'b77da8b7-a4bb-4563-b917-03522aa609e3',
                    orderHash:
                        '0xb9522c23c8667c5e76bf0b855ffabbaebca282f8e396d788c2df75e91a0391d2-5705f2156ef5b2db36c160b36f31ce4',
                    order: {
                        salt: '9445680545936410419330284706951757224702878670220689583677680607556412140293',
                        maker: '0x6edc317f3208b10c46f4ff97faa04dd632487408',
                        receiver: '0x0000000000000000000000000000000000000000',
                        makerAsset:
                            '0x6b175474e89094c44da98b954eedeac495271d0f',
                        takerAsset:
                            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                        makerTraits:
                            '62419173104490761595518734106557662061518414611782227068396304425790442831872',
                        makingAmount: '30000000000000000000',
                        takingAmount: '7516665910385115'
                    },
                    signature:
                        '0xb51731d6e62754ae75d11d13983c19b25fcc1a43fc327710a26ae291fde3d33f52dee7a4c0154256f6bb272260170128242034a89f44e7e887d1bb54a746a5941b',
                    deadline: '2024-04-29T15:27:39.000Z',
                    auctionStartDate: '2024-04-29T15:17:27.000Z',
                    auctionEndDate: '2024-04-29T15:27:27.000Z',
                    remainingMakerAmount: '30000000000000000000',
                    extension:
                        '0x000000cb0000005e0000005e0000005e0000005e0000002f0000000000000000fb2809a5314473e1165f6b58018e20ed8f07b84000000000000000662fba0700025829a7fd01ec57001827bba60018fb2809a5314473e1165f6b58018e20ed8f07b84000000000000000662fba0700025829a7fd01ec57001827bba60018fb2809a5314473e1165f6b58018e20ed8f07b840662fb9efb09498030ae3416b66dc00007bf29735c20c566e5a0c0000950fa635aec75b30781a0000d18bd45f0b94f54a968f000076d49414ad2b8371a4220000a59ca88d5813e693528f000038700d5181a674fdb9a2000038'
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
                    quoteId: 'b77da8b7-a4bb-4563-b917-03522aa609e3',
                    orderHash:
                        '0xb9522c23c8667c5e76bf0b855ffabbaebca282f8e396d788c2df75e91a0391d2-5705f2156ef5b2db36c160b36f31ce4',
                    order: {
                        salt: '9445680545936410419330284706951757224702878670220689583677680607556412140293',
                        maker: '0x6edc317f3208b10c46f4ff97faa04dd632487408',
                        receiver: '0x0000000000000000000000000000000000000000',
                        makerAsset:
                            '0x6b175474e89094c44da98b954eedeac495271d0f',
                        takerAsset:
                            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                        makerTraits:
                            '62419173104490761595518734106557662061518414611782227068396304425790442831872',
                        makingAmount: '30000000000000000000',
                        takingAmount: '7516665910385115'
                    },
                    signature:
                        '0xb51731d6e62754ae75d11d13983c19b25fcc1a43fc327710a26ae291fde3d33f52dee7a4c0154256f6bb272260170128242034a89f44e7e887d1bb54a746a5941b',
                    deadline: '2024-04-29T15:27:39.000Z',
                    auctionStartDate: '2024-04-29T15:17:27.000Z',
                    auctionEndDate: '2024-04-29T15:27:27.000Z',
                    remainingMakerAmount: '30000000000000000000',
                    extension:
                        '0x000000cb0000005e0000005e0000005e0000005e0000002f0000000000000000fb2809a5314473e1165f6b58018e20ed8f07b84000000000000000662fba0700025829a7fd01ec57001827bba60018fb2809a5314473e1165f6b58018e20ed8f07b84000000000000000662fba0700025829a7fd01ec57001827bba60018fb2809a5314473e1165f6b58018e20ed8f07b840662fb9efb09498030ae3416b66dc00007bf29735c20c566e5a0c0000950fa635aec75b30781a0000d18bd45f0b94f54a968f000076d49414ad2b8371a4220000a59ca88d5813e693528f000038700d5181a674fdb9a2000038'
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
                    quoteId: 'b77da8b7-a4bb-4563-b917-03522aa609e3',
                    orderHash:
                        '0xb9522c23c8667c5e76bf0b855ffabbaebca282f8e396d788c2df75e91a0391d2-5705f2156ef5b2db36c160b36f31ce4',
                    order: {
                        salt: '9445680545936410419330284706951757224702878670220689583677680607556412140293',
                        maker: '0x6edc317f3208b10c46f4ff97faa04dd632487408',
                        receiver: '0x0000000000000000000000000000000000000000',
                        makerAsset:
                            '0x6b175474e89094c44da98b954eedeac495271d0f',
                        takerAsset:
                            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                        makerTraits:
                            '62419173104490761595518734106557662061518414611782227068396304425790442831872',
                        makingAmount: '30000000000000000000',
                        takingAmount: '7516665910385115'
                    },
                    signature:
                        '0xb51731d6e62754ae75d11d13983c19b25fcc1a43fc327710a26ae291fde3d33f52dee7a4c0154256f6bb272260170128242034a89f44e7e887d1bb54a746a5941b',
                    deadline: '2024-04-29T15:27:39.000Z',
                    auctionStartDate: '2024-04-29T15:17:27.000Z',
                    auctionEndDate: '2024-04-29T15:27:27.000Z',
                    remainingMakerAmount: '30000000000000000000',
                    extension:
                        '0x000000cb0000005e0000005e0000005e0000005e0000002f0000000000000000fb2809a5314473e1165f6b58018e20ed8f07b84000000000000000662fba0700025829a7fd01ec57001827bba60018fb2809a5314473e1165f6b58018e20ed8f07b84000000000000000662fba0700025829a7fd01ec57001827bba60018fb2809a5314473e1165f6b58018e20ed8f07b840662fb9efb09498030ae3416b66dc00007bf29735c20c566e5a0c0000950fa635aec75b30781a0000d18bd45f0b94f54a968f000076d49414ad2b8371a4220000a59ca88d5813e693528f000038700d5181a674fdb9a2000038'
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
                    quoteId: 'b77da8b7-a4bb-4563-b917-03522aa609e3',
                    orderHash:
                        '0xb9522c23c8667c5e76bf0b855ffabbaebca282f8e396d788c2df75e91a0391d2-5705f2156ef5b2db36c160b36f31ce4',
                    order: {
                        salt: '9445680545936410419330284706951757224702878670220689583677680607556412140293',
                        maker: '0x6edc317f3208b10c46f4ff97faa04dd632487408',
                        receiver: '0x0000000000000000000000000000000000000000',
                        makerAsset:
                            '0x6b175474e89094c44da98b954eedeac495271d0f',
                        takerAsset:
                            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                        makerTraits:
                            '62419173104490761595518734106557662061518414611782227068396304425790442831872',
                        makingAmount: '30000000000000000000',
                        takingAmount: '7516665910385115'
                    },
                    signature:
                        '0xb51731d6e62754ae75d11d13983c19b25fcc1a43fc327710a26ae291fde3d33f52dee7a4c0154256f6bb272260170128242034a89f44e7e887d1bb54a746a5941b',
                    deadline: '2024-04-29T15:27:39.000Z',
                    auctionStartDate: '2024-04-29T15:17:27.000Z',
                    auctionEndDate: '2024-04-29T15:27:27.000Z',
                    remainingMakerAmount: '30000000000000000000',
                    extension:
                        '0x000000cb0000005e0000005e0000005e0000005e0000002f0000000000000000fb2809a5314473e1165f6b58018e20ed8f07b84000000000000000662fba0700025829a7fd01ec57001827bba60018fb2809a5314473e1165f6b58018e20ed8f07b84000000000000000662fba0700025829a7fd01ec57001827bba60018fb2809a5314473e1165f6b58018e20ed8f07b840662fb9efb09498030ae3416b66dc00007bf29735c20c566e5a0c0000950fa635aec75b30781a0000d18bd45f0b94f54a968f000076d49414ad2b8371a4220000a59ca88d5813e693528f000038700d5181a674fdb9a2000038'
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
                    quoteId: 'b77da8b7-a4bb-4563-b917-03522aa609e3',
                    orderHash:
                        '0xb9522c23c8667c5e76bf0b855ffabbaebca282f8e396d788c2df75e91a0391d2-5705f2156ef5b2db36c160b36f31ce4',
                    order: {
                        salt: '9445680545936410419330284706951757224702878670220689583677680607556412140293',
                        maker: '0x6edc317f3208b10c46f4ff97faa04dd632487408',
                        receiver: '0x0000000000000000000000000000000000000000',
                        makerAsset:
                            '0x6b175474e89094c44da98b954eedeac495271d0f',
                        takerAsset:
                            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
                        makerTraits:
                            '62419173104490761595518734106557662061518414611782227068396304425790442831872',
                        makingAmount: '30000000000000000000',
                        takingAmount: '7516665910385115'
                    },
                    signature:
                        '0xb51731d6e62754ae75d11d13983c19b25fcc1a43fc327710a26ae291fde3d33f52dee7a4c0154256f6bb272260170128242034a89f44e7e887d1bb54a746a5941b',
                    deadline: '2024-04-29T15:27:39.000Z',
                    auctionStartDate: '2024-04-29T15:17:27.000Z',
                    auctionEndDate: '2024-04-29T15:27:27.000Z',
                    remainingMakerAmount: '30000000000000000000',
                    extension:
                        '0x000000cb0000005e0000005e0000005e0000005e0000002f0000000000000000fb2809a5314473e1165f6b58018e20ed8f07b84000000000000000662fba0700025829a7fd01ec57001827bba60018fb2809a5314473e1165f6b58018e20ed8f07b84000000000000000662fba0700025829a7fd01ec57001827bba60018fb2809a5314473e1165f6b58018e20ed8f07b840662fb9efb09498030ae3416b66dc00007bf29735c20c566e5a0c0000950fa635aec75b30781a0000d18bd45f0b94f54a968f000076d49414ad2b8371a4220000a59ca88d5813e693528f000038700d5181a674fdb9a2000038'
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
    const wss = new WebSocketServer({port, path: '/ws/v2.0/1'})

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
    const wss = new WebSocketServer({port, path: '/ws/v2.0/1'})

    wss.on('connection', (ws) => {
        for (const message of messages) {
            ws.send(JSON.stringify(message))
        }
    })

    return {url: returnUrl, wss}
}
