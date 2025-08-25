import {Address} from '@1inch/limit-order-sdk'
import {Interface} from 'ethers'
import assert from 'assert'
import {CallInfo} from './types.js'
import {FusionOrder} from '../fusion-order/index.js'
import ABI from '../abi/ETHOrders.abi.json'

export class EthOrdersExtension {
    private readonly iface = new Interface(ABI)

    constructor(public address: Address) {}

    public depositForOrder(
        order: FusionOrder,
        /**
         * Value in bps, i.e. 5000 for 50%
         *
         * Maximum reward (as percentage of gas cost) that resolver receives for cancelling an expired order.
         * The reward is deducted from the order's making amount.
         * To make order cancellation attractive to resolver max reward should be >= 100%
         *
         * @example Order: 1 ETH, Cancellation gas: 0.00001 ETH, Reward: 50%
         * → Resolver gets: 0.000005 ETH (50% of gas cost)
         * → User gets back: 0.999995 ETH
         */
        resolverCancellationMaxReward: bigint = 0n
    ): CallInfo {
        assert(
            order.maker.equal(this.address),
            'maker must be extension address, use FusionOrder.fromNative to create correct order'
        )

        return {
            to: this.address,
            value: order.makingAmount,
            data: this.iface.encodeFunctionData('depositForOrder', [
                order.build(),
                order.extension.encode(),
                resolverCancellationMaxReward,
                order.fusionExtension.auctionDetails.duration
            ])
        }
    }

    // todo: add cancel ixs
}
