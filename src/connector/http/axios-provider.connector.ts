import {HttpProviderConnector} from './http-provider.connector'
import axios from 'axios'

export class AxiosProviderConnector implements HttpProviderConnector {
    constructor(private readonly authKey?: string) {}

    async get<T>(url: string): Promise<T> {
        const res = await axios.get<T>(
            url,
            this.authKey
                ? {
                      headers: {
                          Authorization: `Bearer ${this.authKey}`
                      }
                  }
                : undefined
        )

        return res.data
    }

    async post<T>(url: string, data: unknown): Promise<T> {
        const res = await axios.post<T>(
            url,
            data,
            this.authKey
                ? {
                      headers: {
                          Authorization: `Bearer ${this.authKey}`
                      }
                  }
                : undefined
        )

        return res.data
    }
}
