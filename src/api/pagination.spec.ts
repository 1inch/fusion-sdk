import {PaginationRequest} from './pagination'

describe(__filename, () => {
    describe('validate', () => {
        it('should return null for nulls', () => {
            const request = new PaginationRequest(undefined, undefined)
            expect(request.validate()).toBe(null)
        })

        it('should return error for limit < 1', () => {
            const request = new PaginationRequest(undefined, 0)
            expect(request.validate()).toBe(
                'limit should be in range between 1 and 500'
            )
        })

        it('should return error for limit > 500', () => {
            const request = new PaginationRequest(undefined, 501)
            expect(request.validate()).toBe(
                'limit should be in range between 1 and 500'
            )
        })

        it('should return error for page < 1', () => {
            const request = new PaginationRequest(0, undefined)
            expect(request.validate()).toBe('page should be >= 1')
        })

        it('should return null for valid inputs', () => {
            const request = new PaginationRequest(1, 10)
            expect(request.validate()).toBe(null)
        })
    })
})
