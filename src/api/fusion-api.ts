import {FusionApiConfig} from './types'
import {QuoterApi, QuoterRequest} from './quoter'
import {RelayerApi, RelayerRequest} from './relayer'
import {AxiosProviderConnector} from '../connector'
import {Quote} from './quoter/quote/quote'

export class FusionApi {
    private readonly quoterApi: QuoterApi

    private readonly relayerApi: RelayerApi

    constructor(config: FusionApiConfig) {
        this.quoterApi = QuoterApi.new(
            {
                url: `${config.url}/quoter`,
                network: config.network
            },
            config.httpProvider
        )

        this.relayerApi = RelayerApi.new(
            {
                url: `${config.url}/relayer`,
                network: config.network
            },
            config.httpProvider
        )
    }

    static new(config: FusionApiConfig): FusionApi {
        return new FusionApi({
            network: config.network,
            url: config.url,
            httpProvider: config.httpProvider || new AxiosProviderConnector()
        })
    }

    getQuote(params: QuoterRequest): Promise<Quote> {
        return this.quoterApi.getQuote(params)
    }

    submitOrder(params: RelayerRequest): Promise<void> {
        return this.relayerApi.submit(params)
    }

    submitOrderBatch(params: RelayerRequest[]): Promise<void> {
        return this.relayerApi.submitBatch(params)
    }
}
