import {Address} from '../address'
import assert from 'assert'
import {isHexBytes} from '../validations'
import {trim0x} from '../utils'

export class Interaction {
    constructor(public readonly target: Address, public readonly data: string) {
        assert(isHexBytes(data), 'Interaction data must be valid hex bytes')
    }

    /**
     * Hex string with 0x. First 20 bytes is target, then data
     */
    public encode(): string {
        return this.target.toString() + trim0x(this.data)
    }
}
