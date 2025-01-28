import {isAddress} from 'ethers'

export function isValidAddress(address: string): boolean {
    return isAddress(address)
}

export function isValidAmount(value: string | bigint): boolean {
    try {
        const amount = BigInt(value)

        return amount >= 0n
    } catch {
        return false
    }
}

const HEX_REGEX = /^(0x)[0-9a-f]+$/i
export function isHexString(val: string): boolean {
    return HEX_REGEX.test(val.toLowerCase())
}

/**
 * Check that string is valid hex with 0x prefix and length is even
 * @param val
 */
export function isHexBytes(val: string): boolean {
    return isHexString(val) && val.length % 2 === 0
}
