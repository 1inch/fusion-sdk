import {Address, Bps} from '@1inch/limit-order-sdk'

/**
 * Integrator gets `share` of `fee` to `integrator` and the rest goes to `protocol`
 */
export class IntegratorFee {
    public static ZERO = new IntegratorFee(
        Address.ZERO_ADDRESS,
        Address.ZERO_ADDRESS,
        Bps.ZERO,
        Bps.ZERO
    )

    constructor(
        public readonly integrator: Address,
        public readonly protocol: Address,
        public readonly fee: Bps,
        public readonly share: Bps
    ) {
        if (fee.isZero()) {
            if (!share.isZero()) {
                throw new Error('integrator share must be zero if fee is zero')
            }

            if (!integrator.isZero()) {
                throw new Error(
                    'integrator address must be zero if fee is zero'
                )
            }

            if (!protocol.isZero()) {
                throw new Error('protocol address must be zero if fee is zero')
            }
        }

        if ((integrator.isZero() || protocol.isZero()) && !fee.isZero()) {
            throw new Error(
                'fee must be zero if integrator or protocol is zero address'
            )
        }
    }
}
