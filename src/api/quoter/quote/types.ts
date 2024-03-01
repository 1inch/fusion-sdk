import {PresetEnum} from '../types'
import {Address} from '../../../address'

export type FusionOrderParamsData = {
    preset?: PresetEnum
    receiver?: Address
    nonce?: bigint
    permit?: string
    takingFeeReceiver?: string
    allowPartialFills?: boolean
    allowMultipleFills?: boolean
    delayAuctionStartTimeBy?: bigint
    /**
     * Order will expire in `orderExpirationDelay` after auction ends
     * Default 12s
     */
    orderExpirationDelay?: bigint
}
