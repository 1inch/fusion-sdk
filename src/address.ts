import {isValidAddress} from './validations'
import {add0x} from './utils'
import assert from 'assert'

export class Address {
    static NATIVE_CURRENCY = new Address(
        '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
    )

    static ZERO_ADDRESS = new Address(
        '0x0000000000000000000000000000000000000000'
    )

    private readonly val: string

    constructor(val: string) {
        assert(isValidAddress(val), `Invalid address ${val}`)

        this.val = val.toLowerCase()
    }

    static fromBigInt(val: bigint): Address {
        return new Address(add0x(val.toString(16).padStart(40, '0')))
    }

    static fromFirstBytes(bytes: string): Address {
        return new Address(bytes.slice(0, 42))
    }

    public toString(): string {
        return this.val
    }

    public equal(other: Address): boolean {
        return this.val === other.val
    }

    public isNative(): boolean {
        return this.equal(Address.NATIVE_CURRENCY)
    }

    public isZero(): boolean {
        return this.equal(Address.ZERO_ADDRESS)
    }
}
