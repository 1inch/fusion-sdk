import axios from 'axios'
import {AxiosProviderConnector} from './axios-provider.connector.js'

describe('Axios Http provider connector', () => {
    let httpConnector: AxiosProviderConnector

    beforeEach(() => {
        httpConnector = new AxiosProviderConnector('test-key')
    })

    it('should make get() request', async () => {
        const url = 'https://123.com/test/?val=1'
        const returnedValue = {
            data: {a: 1}
        }
        jest.spyOn(axios, 'get').mockImplementationOnce(() =>
            Promise.resolve(returnedValue)
        )
        const res = await httpConnector.get(url)
        expect(res).toStrictEqual(returnedValue.data)
        expect(axios.get).toHaveBeenCalledWith(url, {
            headers: {Authorization: 'Bearer test-key'}
        })
    })

    it('should make post() request', async () => {
        const url = 'https://123.com/test/?val=1'
        const body = {info: 123}
        const returnedValue = {
            data: {a: 1}
        }
        jest.spyOn(axios, 'post').mockImplementationOnce(() =>
            Promise.resolve(returnedValue)
        )
        const res = await httpConnector.post(url, body)
        expect(res).toStrictEqual(returnedValue.data)
        expect(axios.post).toHaveBeenCalledWith(url, body, {
            headers: {Authorization: 'Bearer test-key'}
        })
    })

    it('omits auth headers when no key is configured', async () => {
        const connector = new AxiosProviderConnector()
        jest.spyOn(axios, 'get').mockResolvedValueOnce({data: {ok: true}})

        await expect(connector.get('https://example.com')).resolves.toEqual({
            ok: true
        })
        expect(axios.get).toHaveBeenCalledWith('https://example.com', undefined)
    })

    it('throws AuthError on 401 responses', async () => {
        const {AuthError} = await import('../../errors.js')
        jest.spyOn(axios, 'get').mockRejectedValueOnce({
            isAxiosError: true,
            response: {status: 401}
        })
        jest.spyOn(axios, 'post').mockRejectedValueOnce({
            isAxiosError: true,
            response: {status: 401}
        })

        await expect(httpConnector.get('https://example.com')).rejects.toBeInstanceOf(
            AuthError
        )
        await expect(
            httpConnector.post('https://example.com', {})
        ).rejects.toBeInstanceOf(AuthError)
    })

    it('rethrows non-auth failures', async () => {
        const boom = new Error('network down')
        jest.spyOn(axios, 'get').mockRejectedValueOnce(boom)
        jest.spyOn(axios, 'post').mockRejectedValueOnce(boom)

        await expect(httpConnector.get('https://example.com')).rejects.toBe(boom)
        await expect(
            httpConnector.post('https://example.com', {})
        ).rejects.toBe(boom)
    })

    it('posts without auth headers when no key is configured', async () => {
        const connector = new AxiosProviderConnector()
        jest.spyOn(axios, 'post').mockResolvedValueOnce({data: {ok: true}})

        await expect(
            connector.post('https://example.com', {a: 1})
        ).resolves.toEqual({ok: true})
        expect(axios.post).toHaveBeenCalledWith(
            'https://example.com',
            {a: 1},
            undefined
        )
    })
})
