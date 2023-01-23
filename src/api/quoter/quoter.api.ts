import {AxiosProviderConnector, HttpProviderConnector} from '../../connector'
import {QuoteRequest} from './quote.request'
import {QuoterConfig, QuoterResponse} from './types'
import {concatQueryParams} from '../params'

export class QuoterApi {
    constructor(
        private readonly config: QuoterConfig,
        private readonly httpClient: HttpProviderConnector
    ) {}

    static new(
        config: QuoterConfig,
        httpClient = new AxiosProviderConnector()
    ): QuoterApi {
        return new QuoterApi(config, httpClient)
    }

    getQuote(params: QuoteRequest): Promise<QuoterResponse> {
        const queryParams = concatQueryParams(params.build())
        const url = `${this.config.url}/v1.0/${this.config.network}/quote/receive/${queryParams}`

        return this.httpClient.get(url)
    }
}
