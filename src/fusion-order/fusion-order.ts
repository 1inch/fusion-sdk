import {SETTLEMENT_EXTENSION_ADDRESS_MAP} from '../constants'
import {AuctionDetails} from '../auction-details'
import {PostInteractionData} from '../post-interaction-data'
import {LimitOrder, OrderInfoDataFusion, MakerTraits} from '../limit-order'
import {FusionExtension} from './fusion-extension'
import assert from 'assert'
import {AuctionCalculator} from '../auction-calculator'

export class FusionOrder extends LimitOrder {
    public readonly extension: FusionExtension

    constructor(
        orderInfo: OrderInfoDataFusion,
        auctionDetails: AuctionDetails,
        postInteractionData: PostInteractionData,
        flags: {
            unwrapWETH?: boolean
            nonce?: bigint
            permit?: string
            allowPartialFills?: boolean
        } = {},
        deadline = auctionDetails.auctionStartTime + 120n
    ) {
        const makerTraits = MakerTraits.default()
            .withExpiration(deadline)
            .allowMultipleFills()

        if (flags.allowPartialFills) {
            makerTraits.allowPartialFills()
        } else {
            makerTraits.disablePartialFills()
        }

        const unwrapWETH =
            flags.unwrapWETH === undefined ? false : flags.unwrapWETH

        if (unwrapWETH) {
            makerTraits.enableNativeUnwrap()
        }

        if (flags.nonce !== undefined) {
            makerTraits.withNonce(flags.nonce).enableEpochManagerCheck()
        }

        const extensionAddress =
            SETTLEMENT_EXTENSION_ADDRESS_MAP[orderInfo.network]

        assert(
            extensionAddress,
            `Fusion extension not exists on chain ${orderInfo.network}`
        )

        const extension = new FusionExtension(
            extensionAddress,
            auctionDetails,
            postInteractionData
        )

        if (flags.permit) {
            extension.withMakerPermit(orderInfo.makerAsset, flags.permit)
        }

        const builtExtension = extension.build()

        super(
            {
                ...orderInfo,
                salt: LimitOrder.buildSalt(builtExtension, orderInfo.salt)
            },
            makerTraits,
            builtExtension
        )

        this.extension = extension
    }

    public getCalculator(): AuctionCalculator {
        return AuctionCalculator.fromAuctionData(
            this.extension.postInteractionData,
            this.extension.details
        )
    }
}
