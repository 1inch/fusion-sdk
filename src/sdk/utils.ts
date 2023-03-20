import {BigNumber} from '@ethersproject/bignumber'
import {ZERO_NUMBER} from '../constants'

export function bpsToRatioFormat(bps?: number): string {
    if (!bps) {
        return ZERO_NUMBER
    }

    return BigNumber.from(bps).mul(100000).toString()
}
