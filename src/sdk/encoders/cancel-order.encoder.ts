import LimitOrderABI from '../../abi/AggregationRouterV6.abi.json'
import {Interface} from 'ethers'
import {MakerTraits} from '../../limit-order/maker-traits'
import assert from 'assert'
import {isHexBytes} from '../../validations'

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
