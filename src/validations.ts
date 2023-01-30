import Web3 from 'web3'
import {BigNumber} from '@ethersproject/bignumber'

export function isValidAddress(address: string): boolean {
    return Web3.utils.isAddress(address)
}

export function isValidAmount(value: string): boolean {
    try {
        const amount = BigNumber.from(value)

        return amount.gt(0)
    } catch (e) {
        return false
    }
}
