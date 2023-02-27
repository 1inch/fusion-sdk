import {GasPriceSpeed, LegacyGasPriceResponse} from './types'
import BigDecimal from 'js-big-decimal'

export class LegacyGasPrice {
    constructor(
        public readonly gasPriceSettings: LegacyGasPriceResponse,
        private readonly speed: GasPriceSpeed
    ) {}

    getNormalizedValue(multiplier = 1): string {
        return this.getGasPrice(multiplier)
    }

    getGasPrice(multiplier = 1): string {
        const gasPrice = this.chooseGasPrice(this.speed)

        if (multiplier === 1) {
            return gasPrice
        }

        const res = new BigDecimal(gasPrice)
            .multiply(new BigDecimal(multiplier))
            .getValue()

        return (+res).toFixed(0)
    }

    private chooseGasPrice(type: GasPriceSpeed): string {
        if (type === GasPriceSpeed.low) {
            return this.gasPriceSettings.slow
        }

        if (type === GasPriceSpeed.medium) {
            return this.gasPriceSettings.standard
        }

        if (type === GasPriceSpeed.high) {
            return this.gasPriceSettings.fast
        }

        if (type === GasPriceSpeed.instant) {
            return this.gasPriceSettings.instant
        }

        throw new Error(`unknown gas price type ${type}`)
    }
}
