import {calcMakingAmount, calcTakingAmount} from './amounts.js'

describe('amount proportions', () => {
    it('ceils the taking amount and floors the making amount', () => {
        expect(calcTakingAmount(1n, 3n, 10n)).toBe(4n)
        expect(calcMakingAmount(10n, 3n, 10n)).toBe(3n)
    })
})
