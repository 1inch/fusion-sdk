import {Address, Bps} from '@1inch/limit-order-sdk'
import {ResolverFee} from './resolver-fee.js'

describe('ResolverFee', () => {
    it('accepts a zero fee on the zero address', () => {
        expect(ResolverFee.ZERO.fee.isZero()).toBe(true)
    })

    it('rejects a fee on the zero address', () => {
        expect(
            () => new ResolverFee(Address.ZERO_ADDRESS, new Bps(10n))
        ).toThrow(/fee must be zero if receiver is zero/)
    })

    it('rejects a whitelist discount when the fee is zero', () => {
        expect(
            () =>
                new ResolverFee(
                    Address.fromBigInt(1n),
                    Bps.ZERO,
                    Bps.fromPercent(1)
                )
        ).toThrow(/whitelist discount must be zero/)
    })
})
