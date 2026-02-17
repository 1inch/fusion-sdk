import {Address, Bps} from '@1inch/limit-order-sdk'
import {PresetEnum} from '../types.js'
import {NetworkEnum} from '../../../constants.js'

export type FusionOrderParamsData = {
    network: NetworkEnum
    preset?: PresetEnum
    receiver?: Address
    nonce?: bigint
    permit?: string
    isPermit2?: boolean
    allowPartialFills?: boolean
    allowMultipleFills?: boolean
    delayAuctionStartTimeBy?: bigint
    /**
     * Order will expire in `orderExpirationDelay` after auction ends
     * Default 12s
     */
    orderExpirationDelay?: bigint
}

/**
 * Integrator fee parameters for SDK requests.
 * Used when calling getQuote() or createOrder().
 */
export type IntegratorFeeRequest = {
    /**
     * Address which will receive integrator's portion of the fee.
     */
    receiver: Address
    /**
     * How much to charge in basis points (1% = 100 bps)
     */
    value: Bps
}

/**
 * Integrator fee parameters from API response.
 * Contains authoritative values calculated by backend.
 */
export type IntegratorFeeResponse = {
    /**
     * Address which will receive `share` of `value` fee, other part will be sent to protocol
     */
    receiver: Address
    /**
     * How much to charge in basis points
     */
    value: Bps
    /**
     * Integrator will receive only `share` part from charged fee (rest goes to protocol)
     */
    share: Bps
}

/**
 * @deprecated Use IntegratorFeeRequest for requests or IntegratorFeeResponse for responses
 */
export type IntegratorFeeParams = IntegratorFeeResponse

export type ResolverFeePreset = {
    /**
     * protocol address
     */
    receiver: Address
    bps: Bps
    whitelistDiscountPercent: Bps
}
