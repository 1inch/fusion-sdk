import abiCoder from 'web3-eth-abi'
import {FillOrderParamsExtended} from '../types'
import {SETTLE_ORDERS_SELECTOR} from './constants'
import {add0x, trim0x} from '../../utils'
import {encodeFillOrder} from './fill-order.encoder'

export function encodeSettleOrders(params: FillOrderParamsExtended): string {
    const encodedOrder = encodeFillOrder(params).substring(10)

    return (
        SETTLE_ORDERS_SELECTOR +
        trim0x(abiCoder.encodeParameters(['bytes'], [add0x(encodedOrder)]))
    )
}

export function buildResolveOrdersBytes(
    settlementContract: string,
    resolverContract: string,
    executionBytes: string
): string {
    return (
        settlementContract +
        '01' +
        trim0x(resolverContract) +
        trim0x(executionBytes)
    )
}

export function buildRecursiveFillInteraction(
    settlementContract: string,
    params: FillOrderParamsExtended
): string {
    return settlementContract + '00' + encodeFillOrder(params).substring(10)
}
