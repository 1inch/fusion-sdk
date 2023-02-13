import {PresetEnum} from '../types'
import {ZERO_ADDRESS} from '../../../constants'
import {FusionOrderParamsData} from './types'

export class FusionOrderParams {
    public readonly preset: PresetEnum = PresetEnum.fast

    public readonly receiver: string = ZERO_ADDRESS

    public readonly nonce: number | string | undefined

    constructor(params: FusionOrderParamsData) {
        if (params.preset) {
            this.preset = params.preset
        }

        if (params.receiver) {
            this.receiver = params.receiver
        }

        this.nonce = params.nonce
    }

    static new(params?: FusionOrderParamsData): FusionOrderParams {
        return new FusionOrderParams(params || {})
    }
}
