import {LimitOrderV4Struct} from '@1inch/limit-order-sdk'
import {RelayerRequestParams} from './types'

export class RelayerRequest {
    public readonly order: LimitOrderV4Struct

    public readonly signature: string

    public readonly quoteId: string

    constructor(params: RelayerRequestParams) {
        this.order = params.order
        this.signature = params.signature
        this.quoteId = params.quoteId
    }

    static new(params: RelayerRequestParams): RelayerRequest {
        return new RelayerRequest(params)
    }

    build(): RelayerRequestParams {
        return {
            order: this.order,
            signature: this.signature,
            quoteId: this.quoteId
        }
    }
}
