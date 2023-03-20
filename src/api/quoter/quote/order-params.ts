import {PresetEnum} from '../types'
import {FusionOrderParamsData} from './types'
import {TakingFeeInfo} from '../../../sdk'
import {ZERO_ADDRESS} from '../../../constants'

export class FusionOrderParams {
    public readonly preset: PresetEnum = PresetEnum.fast

    public readonly receiver: string = ZERO_ADDRESS

    public readonly permit: string | undefined

    public readonly fee: TakingFeeInfo | undefined

    public readonly nonce: number | string | undefined

    constructor(params: FusionOrderParamsData) {
        if (params.preset) {
            this.preset = params.preset
        }

        if (params.receiver) {
            this.receiver = params.receiver
        }

        this.nonce = params.nonce

        this.permit = params.permit

        this.fee = params.fee
    }

    static new(params?: FusionOrderParamsData): FusionOrderParams {
        return new FusionOrderParams(params || {})
    }
}
