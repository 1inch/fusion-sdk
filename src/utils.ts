import assert from 'assert'
import {isHexBytes} from './validations'
import {BN} from './utils/bytes/bn'

export function toSec(time: number | string | Date): number {
    const t = time instanceof Date ? time.getTime() : time

    return Math.floor(+t / 1000)
}

export function toBN(val: number | string): BN {
    if (typeof val === 'number') {
        if (!Number.isSafeInteger(val)) {
            throw new Error('integer is not safe')
        }
    }

    return new BN(BigInt(val))
}

export function trim0x(data: string): string {
    if (data.startsWith('0x')) {
        return data.substring(2)
    }

    return data
}

export function add0x(data: string): string {
    if (data.includes('0x')) {
        return data
    }

    return '0x' + data
}

export function getBytesCount(hex: string): bigint {
    assert(isHexBytes(hex), 'invalid hex')

    return BigInt(trim0x(hex).length / 2)
}
