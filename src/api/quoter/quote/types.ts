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

export type IntegratorFeeParams = {
    /**
     * Address which will receive `share` of `value` fee, other part will be sent to protocol
     */
    receiver: Address
    /**
     * How much to charge
     */
    value: Bps
    /**
     * Integrator will receive only `share` part from charged fee
     */
    share: Bps
}

export type ResolverFeePreset = {
    /**
     * protocol address
     */
    receiver: Address
    bps: Bps
    whitelistDiscountPercent: Bps
}
