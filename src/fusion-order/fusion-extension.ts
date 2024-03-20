import {
    Address,
    Extension,
    ExtensionBuilder,
    Interaction
} from '@1inch/limit-order-sdk'
import {AuctionDetails} from './auction-details'
import {SettlementPostInteractionData} from './settlement-post-interaction-data'

export class FusionExtension extends ExtensionBuilder {
    constructor(
        public readonly address: Address,
        public readonly auctionDetails: AuctionDetails,
        public readonly postInteractionData: SettlementPostInteractionData
    ) {
        super()
    }

    public build(): Extension {
        const detailsBytes = this.auctionDetails.encode()

        this.withMakingAmountData(this.address, detailsBytes)
            .withTakingAmountData(this.address, detailsBytes)
            .withPostInteraction(
                new Interaction(this.address, this.postInteractionData.encode())
            )

        return super.build()
    }
}
