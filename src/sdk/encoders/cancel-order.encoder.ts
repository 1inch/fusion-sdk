import Contract from 'web3-eth-contract'
import LimitOrderV3ABI from '../../abi/AggregationRouterV5.abi.json'
import {AbiItem} from 'web3-utils'
import {LimitOrderV3Struct} from '../../limit-order'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const limitOrderV3 = new Contract(LimitOrderV3ABI as AbiItem[])

export function encodeCancelOrder(params: LimitOrderV3Struct): string {
    return limitOrderV3.methods
        .cancelOrder(
            params.salt,
            params.makerAsset,
            params.takerAsset,
            params.maker,
            params.receiver,
            params.allowedSender,
            params.interactions,
            params.makingAmount,
            params.takingAmount,
            params.offsets
        )
        .encodeABI()
}
