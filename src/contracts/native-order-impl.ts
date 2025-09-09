import {Address, LimitOrderV4Struct} from '@1inch/limit-order-sdk'
import {Interface} from 'ethers'
import {CallInfo} from './types.js'
import ABI from '../abi/NativeOrderImpl.abi.json'

export class NativeOrdersImpl {
    private readonly iface = new Interface(ABI)

    constructor(public address: Address) {}

    public cancel(maker: Address, order: LimitOrderV4Struct): CallInfo {
        return {
            to: this.address,
            value: 0n,
            data: this.iface.encodeFunctionData('cancelOrder', [
                {...order, maker: maker.toString()}
            ])
        }
    }

    public cancelExpiredOrderByResolver(
        maker: Address,
        order: LimitOrderV4Struct,
        rewardLimit: bigint
    ): CallInfo {
        return {
            to: this.address,
            value: 0n,
            data: this.iface.encodeFunctionData(
                'cancelExpiredOrderByResolver',
                [{...order, maker: maker.toString()}, rewardLimit]
            )
        }
    }
}
