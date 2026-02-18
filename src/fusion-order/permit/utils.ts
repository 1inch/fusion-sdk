import assert from 'assert'
import {PERMIT2_ADDRESSES} from './constants.js'
import {NetworkEnum} from '../../constants.js'

export function getPermit2Address(chainId: number): string {
    assert(NetworkEnum[chainId], 'unsupported chainId')

    return PERMIT2_ADDRESSES[chainId as NetworkEnum]
}
