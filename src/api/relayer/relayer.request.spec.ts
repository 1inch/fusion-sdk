import {RelayerRequest} from './relayer.request.js'
import {RelayerRequestParams} from './types.js'

describe('RelayerRequest', () => {
    const params: RelayerRequestParams = {
        order: {
            maker: '0x00000000219ab540356cbb839cbe05303d7705fa',
            makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            makingAmount: '1000000000000000000',
            receiver: '0x0000000000000000000000000000000000000000',
            salt: '1',
            takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            takingAmount: '1420000000',
            makerTraits: '0'
        },
        signature: '0x123signature',
        quoteId: '9a43c86d-f3d7-45b9-8cb6-803d2bdfa08b',
        extension: '0xabcd'
    }

    it('stores fields and rebuilds the submit payload', () => {
        const request = RelayerRequest.new(params)

        expect(request.order).toEqual(params.order)
        expect(request.signature).toBe(params.signature)
        expect(request.quoteId).toBe(params.quoteId)
        expect(request.extension).toBe(params.extension)
        expect(request.build()).toEqual(params)
    })
})
