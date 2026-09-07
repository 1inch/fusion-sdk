import {AuthError} from './errors.js'

describe('AuthError', () => {
    it('tells the caller to use a portal token', () => {
        const error = new AuthError()

        expect(error).toBeInstanceOf(Error)
        expect(error.message).toContain('business.1inch.com/portal')
    })
})
