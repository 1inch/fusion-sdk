import {AuctionDetails} from '../auction-details'
import {PostInteractionData} from '../post-interaction-data'
import {LimitOrder, MakerTraits, OrderInfoData} from '../limit-order'
import {FusionExtension} from './fusion-extension'
import assert from 'assert'
import {AuctionCalculator} from '../auction-calculator'
import {Address} from '../address'

export class FusionOrder extends LimitOrder {
    public readonly fusionExtension: FusionExtension

    constructor(
        /**
         * Fusion extension address
         * @see https://github.com/1inch/limit-order-settlement
         */
        extensionContract: Address,
        orderInfo: OrderInfoData,
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
             * Default is true
             */
            allowMultipleFills?: boolean
            /**
             * Order will expire in `orderExpirationDelay` after auction ends
             * Default 12s
             */
            orderExpirationDelay?: bigint
            enablePermit2?: boolean
        } = {}
    ) {
        const allowPartialFills = extra.allowPartialFills ?? true
        const allowMultipleFills = extra.allowMultipleFills ?? true
        const unwrapWETH = extra.unwrapWETH ?? false
        const enablePermit2 = extra.enablePermit2 ?? false

        const deadline =
            auctionDetails.auctionStartTime +
            auctionDetails.duration +
            (extra.orderExpirationDelay || 12n)

        const makerTraits = MakerTraits.default()
            .withExpiration(deadline)
            .setPartialFills(allowPartialFills)
            .setMultipleFills(allowMultipleFills)

        if (makerTraits.isBitInvalidated()) {
            assert(
                extra.nonce !== undefined,
                'Nonce required, when partial fill or multiple fill disallowed'
            )
        }

        if (unwrapWETH) {
            makerTraits.enableNativeUnwrap()
        }

        if (enablePermit2) {
            makerTraits.enablePermit2()
        }

        if (extra.nonce !== undefined) {
            makerTraits.withNonce(extra.nonce)
        }

        const extension = new FusionExtension(
            extensionContract,
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

        this.fusionExtension = extension
    }

    public getCalculator(): AuctionCalculator {
        return AuctionCalculator.fromAuctionData(
            this.fusionExtension.postInteractionData,
            this.fusionExtension.details
        )
    }
}
