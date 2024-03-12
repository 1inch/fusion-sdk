import {BN} from './bn'
import {BitMask} from './bit-mask'

describe('BN', () => {
    test('clearMask', () => {
        const bn = new BN(0xab7f1111n)
        const mask = new BitMask(16n, 24n)

        expect(bn.clearMask(mask).value).toEqual(0xab001111n)
    })

    test('setBit', () => {
        const bn = new BN(0xab7f1111n)

        expect(bn.setBit(0n, 0).value).toEqual(0xab7f1110n)
        expect(bn.setBit(4n, 0).value).toEqual(0xab7f1101n)

        expect(bn.setBit(1n, 1).value).toEqual(0xab7f1113n)
        expect(bn.setBit(5n, 1).value).toEqual(0xab7f1131n)
    })
})
