import {PresetEnum} from '../types'
import {ZERO_ADDRESS} from '../../../constants'
import {FusionOrderParamsData} from './types'
import {BlockchainProviderConnector} from '../../../connector'
import {OrderNonce} from '../../../nonce-manager/types'

export class FusionOrderParams {
    public readonly preset: PresetEnum = PresetEnum.fast

    public readonly receiver: string = ZERO_ADDRESS

    public readonly blockChainProvider?: BlockchainProviderConnector

    public readonly nonce?: OrderNonce | number | string

    constructor(params: FusionOrderParamsData) {
        if (params.preset) {
            this.preset = params.preset
        }

        if (params.receiver) {
            this.receiver = params.receiver
        }

        this.nonce = params.nonce

        this.blockChainProvider = params.blockchainProvider
    }

    static new(params?: FusionOrderParamsData): FusionOrderParams {
        return new FusionOrderParams(params || {})
    }
}
