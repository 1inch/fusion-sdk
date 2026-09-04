import {add0x, trim0x} from './utils.js'

describe('hex helpers', () => {
    it('trims a 0x prefix and leaves a bare hex string alone', () => {
        expect(trim0x('0xabc')).toBe('abc')
        expect(trim0x('abc')).toBe('abc')
    })

    it('adds a 0x prefix only when it is missing', () => {
        expect(add0x('abc')).toBe('0xabc')
        expect(add0x('0xabc')).toBe('0xabc')
    })
})
