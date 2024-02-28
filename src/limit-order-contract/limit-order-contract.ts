import {LimitOrder, TakerTraits} from '../limit-order'
import {Interface, Signature} from 'ethers'
import LOP_V4_ABI from '../abi/AggregationRouterV5.abi.json'

const lopContract = new Interface(LOP_V4_ABI)

export class LimitOrderContract {
    static getFillOrderArgsCalldata(
        order: LimitOrder,
        signature: string,
        takerTraits: TakerTraits,
        amount: bigint
    ): string {
        const {r, yParityAndS: vs} = Signature.from(signature)
        const {args, trait} = takerTraits.encode()

        return lopContract.encodeFunctionData('fillOrderArgs', [
            order.build(),
            r,
            vs,
            amount,
            trait,
            args
        ])
    }
}
