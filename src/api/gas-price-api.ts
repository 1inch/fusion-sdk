import {GasPriceApiConfig} from './types'
import {AxiosProviderConnector} from '../connector'
import {GasPriceApiService} from './gas-price'
import {GasPrice} from './gas-price'
import {GasPriceSpeed} from '../gas-price/types'

export class GasPriceApi {
    private readonly gasPriceApi: GasPriceApiService

    constructor(config: GasPriceApiConfig) {
        this.gasPriceApi = GasPriceApiService.new(
            {
                url: `https://gas-price-api.1inch.io/v1.3`,
                network: config.network
            },
            config.httpProvider
        )
    }

    static new(config: GasPriceApiConfig): GasPriceApi {
        return new GasPriceApi({
            network: config.network,
            httpProvider: config.httpProvider || new AxiosProviderConnector()
        })
    }

    async getGasPrice(): Promise<GasPrice> {
        const gasPrice = await this.gasPriceApi.requestGasPrice()

        // by default, we set instant speed
        return GasPrice.new(gasPrice, GasPriceSpeed.instant)
    }
}
