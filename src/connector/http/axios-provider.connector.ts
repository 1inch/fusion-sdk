import {HttpProviderConnector} from './http-provider.connector'
import axios from 'axios'

export class AxiosProviderConnector implements HttpProviderConnector {
    async get<T>(url: string): Promise<T> {
        const res = await axios.get<T>(url)

        return res.data
    }

    async post<T>(url: string, data: unknown): Promise<T> {
        const res = await axios.post<T>(url, data)

        return res.data
    }
}
