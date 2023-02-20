import {PresetEnum} from '../types'

// todo: add deadline
export type FusionOrderParamsData = {
    preset?: PresetEnum
    receiver?: string
    nonce?: number | string
    permit?: string
}

export type PredicateParams = {
    address: string
    nonce?: number | string
    deadline: number
}
