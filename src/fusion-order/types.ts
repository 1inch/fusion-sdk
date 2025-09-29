import {AuctionDetails} from './auction-details/auction-details.js'
import {
    AuctionWhitelistItem,
    IntegratorFee
} from './settlement-post-interaction-data'

export type Extra = {
    unwrapWETH?: boolean
    /**
     * Required if `allowPartialFills` or `allowMultipleFills` is false
     * Max size is 40bit
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
    source?: string

    /**
     * When enabled, orders where maker == receiver will have ZERO_ADDRESS set
     * Used to save calldata costs
     * By default: enabled
     */
    optimizeReceiverAddress?: boolean
}

export type Details = {
    auction: AuctionDetails
    whitelist: AuctionWhitelistItem[]
    fees?: {
        integratorFee?: IntegratorFee
        bankFee?: bigint
    }
    resolvingStartTime?: bigint
}
