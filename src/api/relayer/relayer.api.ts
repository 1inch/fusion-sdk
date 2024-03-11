import {RelayerRequest} from './relayer.request'
import {RelayerApiConfig} from './types'
import {AxiosProviderConnector, HttpProviderConnector} from '../../connector'

export class RelayerApi {
    constructor(
        private readonly config: RelayerApiConfig,
        private readonly httpClient: HttpProviderConnector
    ) {}

    static new(
        config: RelayerApiConfig,
        httpClient: HttpProviderConnector = new AxiosProviderConnector(
            config.authKey
        )
    ): RelayerApi {
        return new RelayerApi(config, httpClient)
    }

    submit(params: RelayerRequest): Promise<void> {
        const url = `${this.config.url}/v1.0/${this.config.network}/order/submit`

        return this.httpClient.post(url, params)
    }

    submitBatch(params: RelayerRequest[]): Promise<void> {
        const url = `${this.config.url}/v1.0/${this.config.network}/order/submit/many`

        return this.httpClient.post(url, params)
    }
}
