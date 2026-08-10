import {AuctionDetails} from './auction-details/auction-details.js'
import {Fees} from './fees/index.js'
import {SurplusParams} from './surplus-params.js'
import {Whitelist} from './whitelist/whitelist.js'

export type Extra = {
    unwrapWETH?: boolean
    /**
     * Required if `allowPartialFills` or `allowMultipleFills` is false
     * Max size is 40bit
     */
    nonce?: bigint
    permit?: string
    /**
     * Encoded pre-interaction: target address (20 bytes) followed by calldata.
     * Format matches `Interaction.encode()`: `0x{target}{calldata}`.
     * When set, the PRE_INTERACTION_CALL_FLAG is enabled in makerTraits
     * and the LOP contract calls IPreInteraction on the target before the swap.
     */
    preInteraction?: string
    /**
     * Raw post-interaction bytes appended to the Fusion settlement
     * post-interaction payload.
     *
     * Fusion settlement consumes its own fee/surplus data first, then treats
     * the remaining tail as a chained post-interaction: first 20 bytes are the
     * target and the rest is forwarded as that target's `extraData`.
     *
     * An array is concatenated in order into a single tail; only the first
     * 20 bytes of the result form the single called target — subsequent
     * chunks only extend that target's `extraData`. Empty chunks (`''` /
     * `'0x'`) are ignored.
     */
    chainedPostInteraction?: string | string[]
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
    source?: string
    fees?: Fees

    /**
     * When enabled, orders where maker == receiver will have ZERO_ADDRESS set
     * Used to save calldata costs
     * By default: enabled
     */
    optimizeReceiverAddress?: boolean
}

export type Details = {
    auction: AuctionDetails
    whitelist: Whitelist
    surplus?: SurplusParams
}
