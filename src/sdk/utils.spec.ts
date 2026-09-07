import {addRatioToAmount, bpsToRatioFormat} from './utils.js'

describe('sdk fee helpers', () => {
    it('converts bps to the 1e5 ratio format and treats missing bps as zero', () => {
        expect(bpsToRatioFormat()).toBe(0n)
        expect(bpsToRatioFormat(0)).toBe(0n)
        expect(bpsToRatioFormat(100)).toBe(1000n)
    })

    it('adds a ratio to an amount', () => {
        expect(addRatioToAmount(1000n, 10_000n)).toBe(1100n)
    })
})
