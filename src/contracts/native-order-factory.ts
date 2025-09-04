import {Address} from '@1inch/limit-order-sdk'
import {Interface} from 'ethers'
import {CallInfo} from './types.js'
import {FusionOrder} from '../fusion-order/index.js'
import ABI from '../abi/NativeOrderFactory.abi.json'

export class NativeOrdersFactory {
    private readonly iface = new Interface(ABI)

    constructor(public address: Address) {}

    public create(maker: Address, order: FusionOrder): CallInfo {
        return {
            to: this.address,
            value: order.makingAmount,
            data: this.iface.encodeFunctionData('create', [
                {...order.build(), maker: maker.toString()}
            ])
        }
    }
}
