import {
    Address,
    Extension,
    ExtensionBuilder,
    Interaction
} from '@1inch/limit-order-sdk'
import assert from 'assert'

import {AuctionDetails} from './auction-details'
import {SettlementPostInteractionData} from './settlement-post-interaction-data'

export class FusionExtension {
    private readonly builder = new ExtensionBuilder()

    constructor(
        public readonly address: Address,
        public readonly auctionDetails: AuctionDetails,
        public readonly postInteractionData: SettlementPostInteractionData
    ) {
        const detailsBytes = this.auctionDetails.encode()

        this.builder
            .withMakingAmountData(this.address, detailsBytes)
            .withTakingAmountData(this.address, detailsBytes)
            .withPostInteraction(
                new Interaction(this.address, this.postInteractionData.encode())
            )
    }

    /**
     * Create `FusionExtension` from bytes
     *
     * @param bytes 0x prefixed bytes
     */
    public static decode(bytes: string): FusionExtension {
        const extension = Extension.decode(bytes)

        const settlementContract = Address.fromFirstBytes(
            extension.makingAmountData
        )

        assert(
            Address.fromFirstBytes(extension.takingAmountData).equal(
                settlementContract
            ) &&
                Address.fromFirstBytes(extension.postInteraction).equal(
                    settlementContract
                ),
            'Invalid extension, all calls should be to the same address'
        )

        const auctionDetails = AuctionDetails.fromExtension(extension)

        const postInteractionData =
            SettlementPostInteractionData.fromExtension(extension)

        return new FusionExtension(
            settlementContract,
            auctionDetails,
            postInteractionData
        )
    }

    withMakerPermit(tokenFrom: Address, permitData: string): this {
        this.builder.withMakerPermit(tokenFrom, permitData)

        return this
    }

    public build(): Extension {
        return this.builder.build()
    }
}
