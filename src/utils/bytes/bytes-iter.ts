import assert from 'assert'
import {isHexBytes} from '../../validations'
import {add0x} from '../../utils'

export class BytesIter {
    private bytes: string

    constructor(bytes: string) {
        assert(isHexBytes(bytes), 'invalid bytes value')

        this.bytes = bytes.slice(2) // trim 0x
    }

    public isEmpty(): boolean {
        return this.bytes.length === 0
    }

    public nextByte(): bigint {
        return this.nextBytes(1)
    }

    public nextBytes(n: number): bigint {
        const cnt = n * 2

        if (this.bytes.length < cnt) {
            throw new Error(
                `Can not consume ${n} bytes, have only ${this.bytes.length / 2}`
            )
        }

        const bytes = this.bytes.slice(0, cnt)

        this.bytes = this.bytes.slice(cnt)

        return BigInt(add0x(bytes))
    }

    public nextUint8(): bigint {
        return this.nextByte()
    }

    public nextUint16(): bigint {
        return this.nextBytes(2)
    }

    public nextUint24(): bigint {
        return this.nextBytes(3)
    }

    public nextUint32(): bigint {
        return this.nextBytes(4)
    }

    public nextUint160(): bigint {
        return this.nextBytes(20)
    }
}
