import assert from 'assert'

export class BitMask {
    public readonly offset: bigint

    public readonly mask: bigint

    /**
     *
     *
     * @example
     * const mask1 = new BitMask(0, 16) // for bits from [0, 16) => 0xffff
     * const mask2 = new BitMask(16, 32) // for bits from [0, 16) => 0xffff0000
     * const singleBit = new BitMask(10) // for 10th bit [10, 11)
     *
     * @param startBit bit position from the lowest bit, starts from zero, inclusive
     * @param endBit bit position from the lowest bit, starts from zero, exclusive. Must be bigger than `startBit`
     */
    constructor(startBit: bigint, endBit = startBit + 1n) {
        assert(startBit < endBit, 'BitMask: startBit must be less than endBit')

        this.offset = startBit
        this.mask = (1n << (endBit - startBit)) - 1n
    }

    public toString(): string {
        return '0x' + this.toBigInt().toString(16)
    }

    public toBigInt(): bigint {
        return this.mask << this.offset
    }
}
