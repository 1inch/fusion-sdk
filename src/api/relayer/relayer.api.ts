import {RelayerRequest} from './relayer.request'
import {RelayerApiConfig} from './types'
import {AxiosProviderConnector, HttpProviderConnector} from '../../connector'
import {VERSION} from '../version'

export class RelayerApi {
    private static Version = 'v2.0'

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
        const url = `${this.config.url}/${RelayerApi.Version}/${this.config.network}/order/submit?version=${VERSION}`

        return this.httpClient.post(url, params)
    }

    submitBatch(params: RelayerRequest[]): Promise<void> {
        const url = `${this.config.url}/${RelayerApi.Version}/${this.config.network}/order/submit/many?version=${VERSION}`

        return this.httpClient.post(url, params)
    }
}
