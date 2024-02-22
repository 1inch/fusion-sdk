import {SETTLEMENT_EXTENSION_ADDRESS_MAP} from '../constants'
import {AuctionDetails} from '../auction-details'
import {PostInteractionData} from '../post-interaction-data'
import {LimitOrder, OrderInfoDataFusion} from '../limit-order'
import {MakerTraits} from '../limit-order/maker-traits'
import {FusionExtension} from './fusion-extension'
import assert from 'assert'

export class FusionOrder extends LimitOrder {
    constructor(
        orderInfo: OrderInfoDataFusion,
        auctionDetails: AuctionDetails,
        postInteractionData: PostInteractionData,
        flags: {
            unwrapWETH: boolean
            deadline: bigint
            nonce?: bigint
            permit?: string
            allowPartialFills?: boolean
        }
    ) {
        const makerTraits = MakerTraits.default()
            .withExpiration(flags.deadline)
            .allowMultipleFills()

        if (flags.allowPartialFills) {
            makerTraits.allowPartialFills()
        } else {
            makerTraits.disablePartialFills()
        }

        if (flags.unwrapWETH) {
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
    }
}
