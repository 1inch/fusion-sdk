import {PresetEnum} from '../types'
import {OrderNonce} from '../../../nonce-manager/types'

// todo: add deadline
export type FusionOrderParamsData = {
    preset?: PresetEnum
    receiver?: string
    nonce?: OrderNonce | number | string
}

export type PredicateParams = {
    address: string
    nonce?: number | string
    deadline: number
}
