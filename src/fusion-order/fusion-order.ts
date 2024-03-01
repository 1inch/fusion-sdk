import {AuctionDetails} from '../auction-details'
import {PostInteractionData} from '../post-interaction-data'
import {LimitOrder, MakerTraits, OrderInfoData} from '../limit-order'
import {FusionExtension} from './fusion-extension'
import assert from 'assert'
import {AuctionCalculator} from '../auction-calculator'
import {Address} from '../address'

export class FusionOrder extends LimitOrder {
    private static defaultExtra = {
        allowPartialFills: true,
        allowMultipleFills: true,
        unwrapWETH: false,
        enablePermit2: false,
        orderExpirationDelay: 12n
    }

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
        } = FusionOrder.defaultExtra
    ) {
        const {
            allowPartialFills,
            allowMultipleFills,
            unwrapWETH,
            enablePermit2,
            orderExpirationDelay,
            nonce,
            permit
        } = {
            ...FusionOrder.defaultExtra,
            ...extra
        }

        const deadline =
            auctionDetails.auctionStartTime +
            auctionDetails.duration +
            orderExpirationDelay

        const makerTraits = MakerTraits.default()
            .withExpiration(deadline)
            .setPartialFills(allowPartialFills)
            .setMultipleFills(allowMultipleFills)

        if (makerTraits.isBitInvalidated()) {
            assert(
                nonce !== undefined,
                'Nonce required, when partial fill or multiple fill disallowed'
            )
        }

        if (unwrapWETH) {
            makerTraits.enableNativeUnwrap()
        }

        if (enablePermit2) {
            makerTraits.enablePermit2()
        }

        if (nonce !== undefined) {
            makerTraits.withNonce(nonce)
        }

        const extension = new FusionExtension(
            extensionContract,
            auctionDetails,
            postInteractionData
        )

        if (permit) {
            extension.withMakerPermit(orderInfo.makerAsset, permit)
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
