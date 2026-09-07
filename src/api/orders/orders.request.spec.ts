import {
    ActiveOrdersRequest,
    OrderStatusRequest,
    OrdersByMakerRequest
} from './orders.request.js'

describe('ActiveOrdersRequest', () => {
    it('builds pagination and reports no validation error for valid pages', () => {
        const request = ActiveOrdersRequest.new({page: 2, limit: 10})

        expect(request.validate()).toBeNull()
        expect(request.build()).toEqual({page: 2, limit: 10})
    })

    it('validates out-of-range pagination', () => {
        expect(ActiveOrdersRequest.new({page: 0, limit: 1}).validate()).toMatch(
            /page/
        )
    })
})

describe('OrderStatusRequest', () => {
    const hash =
        '0x1beee023ab933cf5446c298eadadb61c05705f2156ef5b2db36c160b36f31ce4'

    it('builds the hash payload when the hash is valid', () => {
        const request = OrderStatusRequest.new({orderHash: hash})

        expect(request.validate()).toBeNull()
        expect(request.build()).toEqual({orderHash: hash})
    })
})

describe('OrdersByMakerRequest', () => {
    const address = '0xfa80cd9b3becc0b4403b0f421384724f2810775f'

    it('exposes query params for a valid maker', () => {
        const request = OrdersByMakerRequest.new({
            address,
            page: 3,
            limit: 20
        })

        expect(request.validate()).toBeNull()
        expect(request.buildQueryParams()).toEqual({page: 3, limit: 20})
    })
})
