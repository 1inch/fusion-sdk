import {RelayerRequestParams} from './types'
import {LimitOrderV3Struct} from '../../limit-order'

export class RelayerRequest {
    public readonly order: LimitOrderV3Struct

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
