import {Address} from '@1inch/limit-order-sdk'
import {PresetEnum} from '../types'
import {NetworkEnum} from '../../../constants'

export type FusionOrderParamsData = {
    network: NetworkEnum
    preset?: PresetEnum
    receiver?: Address
    nonce?: bigint
    permit?: string
    isPermit2?: boolean
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
