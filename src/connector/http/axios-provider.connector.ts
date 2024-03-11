import axios, {isAxiosError} from 'axios'
import {HttpProviderConnector} from './http-provider.connector'
import {AuthError} from '../../errors'

export class AxiosProviderConnector implements HttpProviderConnector {
    constructor(private readonly authKey?: string) {}

    async get<T>(url: string): Promise<T> {
        try {
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
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 401) {
                throw new AuthError()
            }

            throw error
        }
    }

    async post<T>(url: string, data: unknown): Promise<T> {
        try {
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
        } catch (error) {
            if (isAxiosError(error) && error.response?.status === 401) {
                throw new AuthError()
            }

            throw error
        }
    }
}
