import {Address} from '@1inch/limit-order-sdk'
import {PresetEnum} from '../types'

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
