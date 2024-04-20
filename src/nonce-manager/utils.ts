import {decodeParameter} from 'web3-eth-abi'
import {NONCE_SELECTOR} from './constants'
import {add0x} from '../utils'

export function encodeNonce(address: string): string {
    return add0x(`${NONCE_SELECTOR}${address.substring(2).padStart(64, '0')}`)
}

export function decodeNonce(nonceHex: string): string {
    return (
        decodeParameter('uint256', nonceHex) as {
            toString: () => string
        }
    ).toString()
}
