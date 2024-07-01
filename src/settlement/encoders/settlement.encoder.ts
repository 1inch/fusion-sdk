import * as abiCoder from 'web3-eth-abi'
import {FillOrderParamsExtended} from '../types'
import {SETTLE_ORDERS_SELECTOR} from './constants'
import {add0x, trim0x} from '../../utils'
import {encodeFillOrder} from './fill-order.encoder'

export function encodeSettleOrders(data: string): string {
    data = data.substring(2)

    const len = data.length
    const offset = '20'.padStart(64, '0')
    const bytesLenHex = (len / 2).toString(16).padStart(64, '0')

    if (len % 64 === 0) {
        return SETTLE_ORDERS_SELECTOR + offset + bytesLenHex + data
    }

    return (
        SETTLE_ORDERS_SELECTOR +
        offset +
        bytesLenHex +
        data.padEnd(len + (64 - (len % 64)), '0')
    )
}

export function encodeSettleOrdersParam(
    params: FillOrderParamsExtended
): string {
    const encodedOrder = encodeFillOrder(params).substring(10)

    const offsetLen = 64
    const bytesLenLen = 64

    const dataParam = trim0x(
        abiCoder.encodeParameters(['bytes'], [add0x(encodedOrder)])
    )
    const bytesLen = parseInt(
        dataParam.substring(offsetLen, offsetLen + bytesLenLen),
        16
    )

    return (
        '0x' +
        dataParam.substring(
            offsetLen + bytesLenLen,
            offsetLen + bytesLenLen + bytesLen * 2
        )
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
