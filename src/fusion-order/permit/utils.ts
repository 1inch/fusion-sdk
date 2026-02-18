import {Address} from '@1inch/limit-order-sdk'
import assert from 'assert'
import {PERMIT2_ADDRESSES} from './constants.js'
import {NetworkEnum} from '../../constants.js'

export function getPermit2Address(chainId: number): string {
    assert(NetworkEnum[chainId], 'unsupported chainId')

    return PERMIT2_ADDRESSES[chainId as NetworkEnum]
}

export function getDefaultPermit2Proxy(): Address {
    // todo: fix
    throw new Error(
        'permit2Proxy address is required: no default Permit2Proxy addresses configured'
    )
}
