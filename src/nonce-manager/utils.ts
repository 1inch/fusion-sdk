import {NONCE_SELECTOR} from './constants'
import {add0x} from '../utils'
import {AbiCoder} from 'ethers'

export function encodeNonce(address: string): string {
    return add0x(`${NONCE_SELECTOR}${address.substring(2).padStart(64, '0')}`)
}

export function decodeNonce(nonceHex: string): string {
    return AbiCoder.defaultAbiCoder()
        .decode(['uint256'], nonceHex)[0]
        .toString()
}
