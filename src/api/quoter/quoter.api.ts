import {QuoterRequest} from './quoter.request.js'
import {QuoterApiConfig, QuoterResponse} from './types.js'
import {Quote} from './quote/index.js'
import {QuoterCustomPresetRequest} from './quoter-custom-preset.request.js'
import {concatQueryParams} from '../params.js'
import {
    AxiosProviderConnector,
    HttpProviderConnector
} from '../../connector/index.js'

export class QuoterApi {
    private static Version = 'v2.0'

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
        const url = `${this.config.url}/${QuoterApi.Version}/${this.config.network}/quote/receive/${queryParams}`

        const res = await this.httpClient.get<QuoterResponse>(url)

        return new Quote(params, res)
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
        const url = `${this.config.url}/${QuoterApi.Version}/${this.config.network}/quote/receive/${queryParams}`

        const res = await this.httpClient.post<QuoterResponse>(url, bodyParams)

        return new Quote(params, res)
    }
}
