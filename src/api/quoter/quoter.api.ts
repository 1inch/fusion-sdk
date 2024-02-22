import {AxiosProviderConnector, HttpProviderConnector} from '../../connector'
import {QuoterRequest} from './quoter.request'
import {QuoterApiConfig, QuoterResponse} from './types'
import {concatQueryParams} from '../params'
import {Quote} from './quote'
import {QuoterCustomPresetRequest} from './quoter-custom-preset.request'

export class QuoterApi {
    constructor(
        private readonly config: QuoterApiConfig,
        private readonly httpClient: HttpProviderConnector
    ) {}

    static new(
        config: QuoterApiConfig,
        httpClient: HttpProviderConnector = new AxiosProviderConnector(
            config.authKey
        )
    ): QuoterApi {
        return new QuoterApi(config, httpClient)
    }

    async getQuote(params: QuoterRequest): Promise<Quote> {
        const queryParams = concatQueryParams(params.build())
        const url = `${this.config.url}/v1.0/${this.config.network}/quote/receive/${queryParams}`

        const res = await this.httpClient.get<QuoterResponse>(url)

        return new Quote(this.config.network, params, res)
    }

    async getQuoteWithCustomPreset(
        params: QuoterRequest,
        body: QuoterCustomPresetRequest
    ): Promise<Quote> {
        const bodyErr = body.validate()

        if (bodyErr) {
            throw new Error(bodyErr)
        }

        const queryParams = concatQueryParams(params.build())
        const bodyParams = body.build()
        const url = `${this.config.url}/v1.0/${this.config.network}/quote/receive/${queryParams}`

        const res = await this.httpClient.post<QuoterResponse>(url, bodyParams)

        return new Quote(this.config.network, params, res)
    }
}
