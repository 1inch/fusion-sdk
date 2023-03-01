import {WebSocketSdk} from '.'
import {WebSocketServer, WebSocket} from 'ws'
import {OrderCreatedEvent, OrderEventType, OrderInvalidEvent} from './types'

jest.setTimeout(5 * 60 * 1000)

describe(__filename, () => {
    describe('base', () => {
        it('should be possible to subscribe to message', () => {})

        it('should be possible to subscribe to open', () => {})

        it('should be possible to subscribe to error', () => {})

        it('should be possible to unsubscribe', () => {})
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

            const wsSdk = new WebSocketSdk(url)

            wsSdk.onOpen(() => {
                wsSdk.ping()
            })

            wsSdk.onPong((data) => {
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

            const wsSdk = new WebSocketSdk(url)

            wsSdk.onOpen(() => {
                wsSdk.getAllowedMethods()
            })

            wsSdk.onGetAllowedMethods((data) => {
                expect(data).toEqual(response.result)
                wsSdk.close()
                wss.close()
                done()
            })
        })
    })

    describe('order', () => {
        it('can subscribe to order events', (done) => {
            const message1: OrderCreatedEvent = {
                event: 'order_created',
                data: {
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
                data: {
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4'
                }
            }

            const messages = [message1, message1, message2]
            const {url, wss} = createWebsocketServerMock(messages)

            const wsSdk = new WebSocketSdk(url)

            const resArray: OrderEventType[] = []
            wsSdk.onOrder((data) => {
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
                data: {
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
                data: {
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4'
                }
            }

            const messages = [message2, message1, message1]
            const expectedMessages = [message1, message1]
            const {url, wss} = createWebsocketServerMock(messages)

            const wsSdk = new WebSocketSdk(url)

            const resArray: OrderEventType[] = []
            wsSdk.onOrderCreated((data) => {
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
                data: {
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
                data: {
                    orderHash:
                        '0x1beee023ab933cf5446c298eaddb61c0-5705f2156ef5b2db36c160b36f31ce4'
                }
            }

            const messages = [message1, message1, message2]
            const expectedMessages = [message2]
            const {url, wss} = createWebsocketServerMock(messages)

            const wsSdk = new WebSocketSdk(url)

            const resArray: OrderEventType[] = []
            wsSdk.onOrderInvalid((data) => {
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

        it('can subscribe to order not enough balance or allowance events', () => {})
        it('can subscribe to order filled events', () => {})

        it('can subscribe to order filled partially events', () => {})
    })
})

function createWebsocketRpcServerMock(cb: (ws: WebSocket, data: any) => void): {
    url: string
    wss: WebSocketServer
} {
    const port = 8080
    const url = `ws://localhost:${port}`
    const wss = new WebSocketServer({port})

    wss.on('connection', (ws) => {
        ws.on('message', (data) => cb(ws, data))
    })

    return {url, wss}
}

function createWebsocketServerMock(messages: any[]): {
    url: string
    wss: WebSocketServer
} {
    const port = 8080
    const url = `ws://localhost:${port}`
    const wss = new WebSocketServer({port})

    wss.on('connection', (ws) => {
        for (const message of messages) {
            ws.send(JSON.stringify(message))
        }
    })

    return {url, wss}
}
