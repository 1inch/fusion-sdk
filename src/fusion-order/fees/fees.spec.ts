import {Address, Bps} from '@1inch/limit-order-sdk'
import {Fees} from './fees.js'
import {ResolverFee} from './resolver-fee.js'
import {IntegratorFee} from './integrator-fee.js'

describe('Fees', () => {
    it('builds resolver-only and integrator-only fee sets', () => {
        const receiver = Address.fromBigInt(1n)
        const resolverOnly = Fees.resolverFee(
            new ResolverFee(receiver, new Bps(10n))
        )
        expect(resolverOnly.integrator.fee.isZero()).toBe(true)
        expect(resolverOnly.protocol.equal(receiver)).toBe(true)

        const integrator = new IntegratorFee(
            Address.fromBigInt(2n),
            Address.fromBigInt(3n),
            new Bps(10n),
            Bps.fromPercent(50)
        )
        const integratorOnly = Fees.integratorFee(integrator)
        expect(integratorOnly.resolver.fee.isZero()).toBe(true)
        expect(integratorOnly.protocol.equal(Address.fromBigInt(3n))).toBe(true)
    })
})
