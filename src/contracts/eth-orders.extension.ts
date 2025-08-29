import {Address, LimitOrderV4Struct} from '@1inch/limit-order-sdk'
import {Interface} from 'ethers'
import assert from 'assert'
import {CallInfo} from './types.js'
import {FusionOrder, CancellationAuction} from '../fusion-order/index.js'
import ABI from '../abi/ETHOrders.abi.json'

export class EthOrdersExtension {
    private readonly iface = new Interface(ABI)

    constructor(public address: Address) {}

    public deposit(
        order: FusionOrder,
        cancellationAuction = CancellationAuction.ZERO
    ): CallInfo {
        assert(
            order.maker.equal(this.address),
            'maker must be extension address, use FusionOrder.fromNative to create correct order'
        )

        return {
            to: this.address,
            value: order.makingAmount,
            data: this.iface.encodeFunctionData('deposit', [
                order.build(),
                order.extension.encode(),
                cancellationAuction.build()
            ])
        }
    }

    public cancelOrder(orderHash: string): CallInfo {
        return {
            to: this.address,
            value: 0n,
            data: this.iface.encodeFunctionData('cancelOrder', [orderHash])
        }
    }

    public cancelExpiredOrderByResolver(
        maker: Address,
        orderInfo: LimitOrderV4Struct
    ): CallInfo {
        return {
            value: 0n,
            data: this.iface.encodeFunctionData(
                'cancelExpiredOrderByResolver',
                [maker.toString(), orderInfo]
            ),
            to: this.address
        }
    }
}
