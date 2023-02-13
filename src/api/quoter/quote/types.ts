import {PresetEnum} from '../types'

// todo: add deadline
export type FusionOrderParamsData = {
    preset?: PresetEnum
    receiver?: string
    nonce?: number
}

export type TimeStampVerificationWithNonceParams = {
    address: string
    nonce?: number
}

export type TimeStampVerificationParams = {
    deadline: number
}

export type DeadlineVerificationParams = TimeStampVerificationParams &
    TimeStampVerificationWithNonceParams
