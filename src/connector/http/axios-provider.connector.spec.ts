import axios from 'axios'
import {AxiosProviderConnector} from './axios-provider.connector'

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
})
