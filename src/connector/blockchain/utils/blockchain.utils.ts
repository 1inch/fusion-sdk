import {BigNumber} from '@ethersproject/bignumber'

export function decimalToHex(d: number | string): string {
    return BigNumber.from(d).toHexString()
}
