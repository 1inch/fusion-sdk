import {Interface} from 'ethers'
import {MakerTraits} from '@1inch/limit-order-sdk'
import assert from 'assert'
import LimitOrderABI from '../../abi/AggregationRouterV6.abi.json' with {type: 'json'}
import {isHexBytes} from '../../validations.js'

const lopAbi = new Interface(LimitOrderABI)

export function encodeCancelOrder(
    hash: string,
    makerTraits: MakerTraits
): string {
    assert(isHexBytes(hash), 'Invalid order hash')

    return lopAbi.encodeFunctionData('cancelOrder', [
        makerTraits.asBigInt(),
        hash
    ])
}
