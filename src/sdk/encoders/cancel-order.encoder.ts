import Contract from 'web3-eth-contract'
import LimitOrderV3ABI from '../../abi/AggregationRouterV5.abi.json'
import {AbiItem} from 'web3-utils'
import {LimitOrderV3Struct} from '../../limit-order'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const limitOrderV3 = new Contract(LimitOrderV3ABI as AbiItem[])

export function encodeCancelOrder(params: LimitOrderV3Struct): string {
    return limitOrderV3.methods
        .cancelOrder({
            salt: params.salt,
            makerAsset: params.makerAsset,
            takerAsset: params.takerAsset,
            maker: params.maker,
            receiver: params.receiver,
            allowedSender: params.allowedSender,
            interactions: params.interactions,
            makingAmount: params.makingAmount,
            takingAmount: params.takingAmount,
            offsets: params.offsets
        })
        .encodeABI()
}
