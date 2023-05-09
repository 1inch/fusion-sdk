import {SETTLEMENT_CONTRACT_ADDRESS_MAP} from '../constants'
import {AuctionSalt} from '../auction-salt'
import {AuctionSuffix} from '../auction-suffix'
import {
    LimitOrder,
    InteractionsData,
    LimitOrderV3Struct,
    OrderInfoDataFusion
} from '../limit-order'

export class FusionOrder extends LimitOrder {
    constructor(
        orderInfo: OrderInfoDataFusion,
        private readonly auction: AuctionSalt,
        private readonly auctionSuffix: AuctionSuffix,
        interactions?: InteractionsData
    ) {
        super(
            {
                ...orderInfo,
                allowedSender:
                    SETTLEMENT_CONTRACT_ADDRESS_MAP[orderInfo.network]
            },
            interactions
        )
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
