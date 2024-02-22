import {BitMask} from './bit-mask'

describe('BitMask', () => {
    it('Should create single bit mask', () => {
        expect(new BitMask(0n).toString()).toEqual('0x1')
        expect(new BitMask(1n).toString()).toEqual('0x2')
        expect(new BitMask(16n).toString()).toEqual('0x10000')
    })

    it('Should create multi bit mask', () => {
        expect(new BitMask(0n, 16n).toString()).toEqual('0xffff')
        expect(new BitMask(16n, 32n).toString()).toEqual('0xffff0000')
        expect(new BitMask(32n, 35n).toString()).toEqual('0x700000000')
    })
})
