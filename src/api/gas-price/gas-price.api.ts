import {LondonGasPriceResponse} from '../../gas-price/types'
import {LegacyGasPriceResponse} from '../../gas-price/types'
import {AxiosProviderConnector, HttpProviderConnector} from '../../connector'
import {GasPriceApiConfig} from './types'

export class GasPriceApiService {
    constructor(
        private readonly config: GasPriceApiConfig,
        private readonly httpClient: HttpProviderConnector
    ) {}

    static new(
        config: GasPriceApiConfig,
        httpClient = new AxiosProviderConnector()
    ): GasPriceApiService {
        return new GasPriceApiService(config, httpClient)
    }

    async requestGasPrice(): Promise<
        LondonGasPriceResponse | LegacyGasPriceResponse
    > {
        const url = `${this.config.url}/${this.config.network}`

        return this.httpClient.get<
            LondonGasPriceResponse | LegacyGasPriceResponse
        >(url)
    }
}
