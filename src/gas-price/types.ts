export enum GasPriceSpeed {
    low = 'low',
    medium = 'medium',
    high = 'high',
    instant = 'instant'
}

export type LegacyGasPriceResponse = {
    fast: string
    instant: string
    standard: string
    slow: string
}

export type EipGasPrice = {baseFee: string} & LondonGasPriceMaxValues

export type LondonGasPriceMaxValues = {
    maxPriorityFeePerGas: string
    maxFeePerGas: string
}

export type LondonGasPriceResponse = {
    baseFee: string
    low: LondonGasPriceMaxValues
    medium: LondonGasPriceMaxValues
    high: LondonGasPriceMaxValues
    instant: LondonGasPriceMaxValues
}
