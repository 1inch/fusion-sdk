import {Address} from '@1inch/limit-order-sdk'
import {Interface} from 'ethers'
import {CallInfo} from './types.js'
import {FusionOrder} from '../fusion-order/index.js'
import ABI from '../abi/NativeOrderImpl.abi.json'

export class NativeOrdersImpl {
    private readonly iface = new Interface(ABI)

    constructor(public address: Address) {}

    public cancel(maker: Address, order: FusionOrder): CallInfo {
        return {
            to: this.address,
            value: 0n,
            data: this.iface.encodeFunctionData('cancelOrder', [
                {...order.build(), maker: maker.toString()}
            ])
        }
    }

    public cancelExpiredOrderByResolver(
        maker: Address,
        order: FusionOrder
    ): CallInfo {
        return {
            to: this.address,
            value: 0n,
            data: this.iface.encodeFunctionData(
                'cancelExpiredOrderByResolver',
                [{...order.build(), maker: maker.toString()}]
            )
        }
    }
}
