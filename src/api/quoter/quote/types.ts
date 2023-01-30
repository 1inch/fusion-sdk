import {PresetEnum} from '../types'

// todo: add deadline and nonce
export type FusionOrderParamsData = {
    preset?: PresetEnum
    receiver?: string
}
