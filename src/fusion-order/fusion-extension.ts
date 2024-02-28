import {Extension} from 'src/limit-order/extension'
import {Address} from '../address'
import {ExtensionBuilder} from '../limit-order/extension-builder'
import {AuctionDetails} from '../auction-details'
import {PostInteractionData} from '../post-interaction-data'
import {Interaction} from '../limit-order/interaction'

export class FusionExtension extends ExtensionBuilder {
    constructor(
        public readonly address: Address,
        public readonly details: AuctionDetails,
        public readonly postInteractionData: PostInteractionData
    ) {
        super()
    }

    public build(): Extension {
        const detailsBytes = this.details.encode()

        this.withMakingAmountData(this.address, detailsBytes)
            .withTakingAmountData(this.address, detailsBytes)
            .withPostInteraction(
                new Interaction(this.address, this.postInteractionData.encode())
            )

        return super.build()
    }
}
