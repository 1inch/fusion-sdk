import {add0x} from './utils'
import {BitMask} from './bit-mask'
import assert from 'assert'

export class BN {
    constructor(public readonly value: bigint) {}

    public setBit(n: bigint, value: 1 | 0): BN {
        if (value) {
            return new BN(this.value | (1n << n))
        }

        return new BN(this.value & ~(1n << n))
    }

    public getBit(n: bigint): 1 | 0 {
        return (this.value & (1n << n)) === 0n ? 0 : 1
    }

    public shiftLeft(n: bigint): BN {
        return new BN(this.value << n)
    }

    public shiftRight(n: bigint): BN {
        return new BN(this.value >> n)
    }

    public and(other: BN | bigint): BN {
        const raw = typeof other === 'bigint' ? other : other.value

        return new BN(raw & this.value)
    }

    public or(other: BN | bigint): BN {
        const raw = typeof other === 'bigint' ? other : other.value

        return new BN(raw | this.value)
    }

    public xor(other: BN | bigint): BN {
        const raw = typeof other === 'bigint' ? other : other.value

        return new BN(raw ^ this.value)
    }

    public isZero(): boolean {
        return this.value === 0n
    }

    public isOne(): boolean {
        return this.value === 1n
    }

    public getMask(mask: BitMask): BN {
        return this.shiftRight(mask.offset).and(mask.mask)
    }

    public setMask(mask: BitMask, value: BN | bigint): BN {
        const raw = typeof value === 'bigint' ? value : value.value
        assert(
            raw <= mask.mask,
            `Value 0x${raw.toString(16)} to big for mask ${mask}`
        )

        return new BN(this.clearMask(mask).value | (raw << mask.offset))
    }

    public clearMask(mask: BitMask): BN {
        return new BN(this.value - (mask.toBigInt() & this.value))
    }

    public toHex(pad = 0): string {
        return add0x(this.value.toString(16).padStart(pad, '0'))
    }
}
