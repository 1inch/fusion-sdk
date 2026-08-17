import {Address} from '@1inch/limit-order-sdk'

/**
 * `Interaction`-shaped value for a target-only payload (exactly 20 bytes,
 * empty data), which is a valid chained post-interaction tail: `FeeTaker`
 * calls the target for any tail of at least 20 bytes.
 *
 * A dedicated class is required because the `Interaction` constructor
 * rejects empty data (`isHexBytes('0x')` is false).
 */
export class TargetOnlyInteraction {
    public readonly data = '0x'

    constructor(public readonly target: Address) {}

    public encode(): string {
        return this.target.toString()
    }
}
