import {Interaction} from '@1inch/limit-order-sdk'
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

    /**
     * Allows maker to execute custom code before order executed
     * @see https://github.com/1inch/limit-order-protocol/blob/master/docs/interfaces/IPreInteraction.md
     */
    preInteraction?: Interaction

    /**
     * Allows maker to execute custom code after order executed
     * @see https://github.com/1inch/limit-order-protocol/blob/master/docs/interfaces/IPostInteraction.md
     */
    postInteraction?: Interaction
}

export type Details = {
    auction: AuctionDetails
    whitelist: Whitelist
    surplus?: SurplusParams
}
