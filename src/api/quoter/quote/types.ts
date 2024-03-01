import {PresetEnum} from '../types'
import {Address} from '../../../address'

export type FusionOrderParamsData = {
    preset?: PresetEnum
    receiver?: Address
    nonce?: bigint
    permit?: string
    takingFeeReceiver?: string
    allowPartialFills?: boolean
    delayAuctionStartTimeBy?: bigint
}
