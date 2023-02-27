import {BigNumber} from '@ethersproject/bignumber'
import BigDecimal from 'js-big-decimal'
import {LegacyGasPriceResponse} from '../../gas-price/types'
import {LegacyGasPrice} from '../../gas-price/legacy-gas-price'
import {LondonGasPrice} from '../../gas-price/london-gas-price'
import {LondonGasPriceResponse} from '../../gas-price/types'
import {GasPriceSpeed} from '../../gas-price/types'

export class GasPrice {
    public readonly value: LondonGasPrice | LegacyGasPrice

    constructor(private readonly gasPrice: LondonGasPrice | LegacyGasPrice) {
        this.value = gasPrice
    }

    static new(
        gasPrice: LondonGasPriceResponse | LegacyGasPriceResponse,
        speed: GasPriceSpeed
    ): GasPrice {
        if (Object(gasPrice).hasOwnProperty('baseFee')) {
            const london = new LondonGasPrice(
                gasPrice as LondonGasPriceResponse,
                speed
            )

            return new GasPrice(london)
        }

        const legacy = new LegacyGasPrice(
            gasPrice as LegacyGasPriceResponse,
            speed
        )

        return new GasPrice(legacy)
    }
}
