import {Address} from '@1inch/limit-order-sdk'
import {FusionOrderParamsData} from './types.js'
import {PresetEnum} from '../types.js'

export class FusionOrderParams {
    public readonly preset: PresetEnum = PresetEnum.fast

    public readonly receiver: Address = Address.ZERO_ADDRESS

    public readonly permit: string | undefined

    public readonly nonce: bigint | undefined

    public readonly delayAuctionStartTimeBy: bigint

    public readonly isPermit2?: boolean

    constructor(params: FusionOrderParamsData) {
        if (params.preset) {
            this.preset = params.preset
        }

        if (params.receiver) {
            this.receiver = params.receiver
        }

        this.isPermit2 = params.isPermit2
        this.nonce = params.nonce
        this.permit = params.permit
        this.delayAuctionStartTimeBy = params.delayAuctionStartTimeBy || 0n
    }

    static new(params: FusionOrderParamsData): FusionOrderParams {
        return new FusionOrderParams(params)
    }
}
