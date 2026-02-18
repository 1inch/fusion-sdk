import {Address} from '@1inch/limit-order-sdk'
import assert from 'assert'
import {PERMIT2_ADDRESSES, PERMIT2_PROXY_ADDRESSES} from './constants.js'
import {NetworkEnum} from '../../constants.js'

export function getPermit2Address(chainId: number): string {
    assert(NetworkEnum[chainId], 'unsupported chainId')

    return PERMIT2_ADDRESSES[chainId as NetworkEnum]
}

export function getPermit2ProxyAddress(chainId: number): Address {
    assert(NetworkEnum[chainId], 'unsupported chainId')

    return new Address(PERMIT2_PROXY_ADDRESSES[chainId as NetworkEnum])
}
