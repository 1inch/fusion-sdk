import Contract from 'web3-eth-contract'
import LimitOrderV3ABI from '../../abi/AggregationRouterV5.abi.json'
import {AbiItem} from 'web3-utils'
import {FillOrderParamsExtended} from '../types'
import {patchSignature} from '../signature-patcher'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const limitOrderV3 = new Contract(LimitOrderV3ABI as AbiItem[])

export function encodeFillOrder(params: FillOrderParamsExtended): string {
    return limitOrderV3.methods
        .fillOrderTo(
            params.order,
            patchSignature(params.signature),
            params.interaction,
            params.makingAmount,
            params.takingAmount,
            params.thresholdAmount,
            params.target
        )
        .encodeABI()
}
