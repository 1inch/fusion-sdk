import BigDecimal from 'js-big-decimal'
import {EipGasPrice, GasPriceSpeed, LondonGasPriceResponse} from './types'
import {calcNormalizedGasPriceForLondon} from './utils'

export class LondonGasPrice {
    constructor(
        public readonly gasPriceSettings: LondonGasPriceResponse,
        private readonly speed: GasPriceSpeed
    ) {}

    getNormalizedValue(multiplier = 1): string {
        const {baseFee, maxPriorityFeePerGas} = this.getGasPrice(multiplier)

        return calcNormalizedGasPriceForLondon(baseFee, maxPriorityFeePerGas)
    }

    getGasPrice(multiplier = 1): EipGasPrice {
        const value = {
            baseFee: this.gasPriceSettings.baseFee,
            ...this.gasPriceSettings[this.speed]
        }

        if (multiplier === 1) {
            return value
        }

        const mulMaxFeePerGas = new BigDecimal(value.maxFeePerGas)
            .multiply(new BigDecimal(multiplier))
            .getValue()

        const normalizedGasPriceForLondon = calcNormalizedGasPriceForLondon(
            this.gasPriceSettings.baseFee,
            this.gasPriceSettings[this.speed].maxPriorityFeePerGas
        )
        const mulMaxPriorityFeePerGas = new BigDecimal(
            normalizedGasPriceForLondon
        )
            .multiply(new BigDecimal(multiplier))
            .getValue()

        value.maxFeePerGas = (+mulMaxFeePerGas).toFixed(0)
        value.maxPriorityFeePerGas = (+mulMaxPriorityFeePerGas).toFixed(0)

        return value
    }
}
