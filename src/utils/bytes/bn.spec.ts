import {BN} from './bn'
import {BitMask} from './bit-mask'

describe('BN', () => {
    test('clearMask', () => {
        const bn = new BN(0xab7f1111n)
        const mask = new BitMask(16n, 24n)

        expect(bn.clearMask(mask).value).toEqual(0xab001111n)
    })
})
