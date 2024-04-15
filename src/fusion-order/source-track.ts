import {BitMask, BN} from '@1inch/byte-utils'
import {keccak256} from 'ethers'

const TRACK_CODE_MASK = new BitMask(224n, 256n)

function getTrackCodeForSource(source: string): bigint {
    return BigInt(keccak256(source).slice(10))
}

export function addTrackCode(salt: bigint, source: string): bigint {
    const track = getTrackCodeForSource(source)

    return new BN(salt).setMask(TRACK_CODE_MASK, track).value
}
