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
        extra: {
            unwrapWETH?: boolean
            /**
             * Required if `allowPartialFills` is false
             */
            nonce?: bigint
            permit?: string
            /**
             * Default is true
             */
            allowPartialFills?: boolean
            /**
             * Default deadline is 2m
             */
            deadline?: bigint
        } = {}
    ) {
        const makerTraits = MakerTraits.default()
            .withExpiration(
                extra.deadline || auctionDetails.auctionStartTime + 120n
            )
            .allowMultipleFills()

        const allowPartialFills = extra.allowPartialFills ?? true

        if (allowPartialFills) {
            makerTraits.allowPartialFills()
        } else {
            makerTraits.disablePartialFills()

            assert(
                extra.nonce !== undefined,
                'Nonce required, when partial fills disabled'
            )
        }

        const unwrapWETH = extra.unwrapWETH ?? false

        if (unwrapWETH) {
            makerTraits.enableNativeUnwrap()
        }

        if (extra.nonce !== undefined) {
            makerTraits.withNonce(extra.nonce)
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

        if (extra.permit) {
            extension.withMakerPermit(orderInfo.makerAsset, extra.permit)
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
