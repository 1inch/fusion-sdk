import {PresetEnum} from '../types'
import {TakingFeeInfo} from '../../../sdk'

// todo: add deadline
export type FusionOrderParamsData = {
    preset?: PresetEnum
    receiver?: string
    nonce?: number | string
    permit?: string
    fee?: TakingFeeInfo
}

export type PredicateParams = {
    address: string
    nonce?: number | string
    deadline: number
}
