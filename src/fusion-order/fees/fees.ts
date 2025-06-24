import {Address} from '@1inch/limit-order-sdk'
import assert from 'assert'
import {ResolverFee} from './resolver-fee'
import {IntegratorFee} from './integrator-fee'

export class Fees {
    /**
     * 100% = 100000
     */
    public static BASE_1E5 = 100_000n

    /**
     * 100% = 100
     */
    public static BASE_1E2 = 100n

    constructor(
        public readonly resolver: ResolverFee,
        public readonly integrator: IntegratorFee
    ) {
        if (!resolver.fee.isZero() && !integrator.fee.isZero()) {
            assert(
                resolver.receiver.equal(integrator.protocol),
                'resolver fee receiver address and integrator fee protocol address must be same'
            )
        }

        // assert(
        //     !(resolver.fee.isZero() && integrator.fee.isZero()),
        //     'at least one fee must be set'
        // )

        assert(
            this.integrator.fee.toFraction() < 0.6553,
            'max fee is 65.53%' // 2bytes
        )
        assert(
            this.resolver.fee.toFraction() < 0.6553,
            'max fee is 65.53%' // 2bytes
        )
    }

    public get protocol(): Address {
        return this.integrator.fee.isZero()
            ? this.resolver.receiver
            : this.integrator.protocol
    }

    static resolverFee(fee: ResolverFee): Fees {
        return new Fees(fee, IntegratorFee.ZERO)
    }

    static integratorFee(fee: IntegratorFee): Fees {
        return new Fees(ResolverFee.ZERO, fee)
    }
}
