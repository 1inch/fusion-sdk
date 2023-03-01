import {WebSocketSdk} from '.'
import {WebSocketServer, WebSocket} from 'ws'

jest.setTimeout(5 * 60 * 1000)

describe(__filename, () => {
    describe('rpc', () => {
        it('can ping pong ', (done) => {
            const response = {method: 'ping', result: 'pong'}
            const {url, wss} = createWebsocketServerMock((ws, data) => {
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
            const {url, wss} = createWebsocketServerMock((ws, data) => {
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
        const response = {
            method: 'getAllowedMethods',
            result: ['ping', 'getAllowedMethods']
        }
        const {url, wss} = createWebsocketServerMock((ws, data) => {
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

function createWebsocketServerMock(cb: (ws: WebSocket, data: any) => void): {
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
