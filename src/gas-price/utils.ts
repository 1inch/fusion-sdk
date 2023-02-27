import {BigNumber} from '@ethersproject/bignumber'

export function calcNormalizedGasPriceForLondon(
    baseFee: string,
    maxPriorityFeePerGas: string
): string {
    // https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1559.md
    const maxBaseFeeIncreasePerBlockDenominator = 8
    const baseFeeBN = BigNumber.from(baseFee)

    return baseFeeBN
        .add(baseFeeBN.div(maxBaseFeeIncreasePerBlockDenominator))
        .add(maxPriorityFeePerGas)
        .toString()
}
