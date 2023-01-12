import {AuctionSalt} from '../auction-salt'
import {AuctionSuffix} from '../auction-suffix'
import {
    LimitOrder,
    InteractionsData,
    LimitOrderV3Struct,
    OrderInfoData
} from '../limit-order'

export class FusionOrder extends LimitOrder {
    constructor(
        orderInfo: OrderInfoData,
        private readonly auction: AuctionSalt,
        private readonly auctionSuffix: AuctionSuffix,
        interactions?: InteractionsData
    ) {
        super(orderInfo, interactions)
    }

    build(): LimitOrderV3Struct {
        this.salt = this.auction.build()
        const order = super.build()

        return {
            ...order,
            interactions: order.interactions + this.auctionSuffix.build()
        }
    }
}
