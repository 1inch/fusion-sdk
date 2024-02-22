import {Extension} from 'src/limit-order/extension'
import {Address} from '../address'
import {ExtensionBuilder} from '../limit-order/extension-builder'
import {AuctionDetails} from '../auction-details'
import {PostInteractionData} from '../post-interaction-data'

export class FusionExtension extends ExtensionBuilder {
    constructor(
        private readonly address: Address,
        private readonly details: AuctionDetails,
        private readonly postInteractionData: PostInteractionData
    ) {
        super()
    }

    public build(): Extension {
        const detailsBytes = this.details.encode()

        this.withMakingAmountData(this.address, detailsBytes)
            .withTakingAmountData(this.address, detailsBytes)
            .withPostInteraction(
                this.address,
                this.postInteractionData.encode()
            )

        return super.build()
    }
}
