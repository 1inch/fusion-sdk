import {PresetEnum} from '../types'
import {BlockchainProviderConnector} from '../../../connector'

// todo: add deadline
export type FusionOrderParamsData = {
    preset?: PresetEnum
    receiver?: string
    nonce?: number | string
    blockchainProvider?: BlockchainProviderConnector
}

export type PredicateParams = {
    address: string
    nonce?: number | string
    deadline: number
}
