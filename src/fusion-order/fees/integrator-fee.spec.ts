import {Address, Bps} from '@1inch/limit-order-sdk'
import {IntegratorFee} from './integrator-fee.js'

describe('IntegratorFee', () => {
    it('accepts a zero fee only when share and addresses are zero', () => {
        expect(IntegratorFee.ZERO.fee.isZero()).toBe(true)
    })

    it('rejects a non-zero share when the fee is zero', () => {
        expect(
            () =>
                new IntegratorFee(
                    Address.ZERO_ADDRESS,
                    Address.ZERO_ADDRESS,
                    Bps.ZERO,
                    Bps.fromPercent(10)
                )
        ).toThrow(/integrator share must be zero/)
    })

    it('rejects a non-zero integrator address when the fee is zero', () => {
        expect(
            () =>
                new IntegratorFee(
                    Address.fromBigInt(1n),
                    Address.ZERO_ADDRESS,
                    Bps.ZERO,
                    Bps.ZERO
                )
        ).toThrow(/integrator address must be zero/)
    })

    it('rejects a non-zero protocol address when the fee is zero', () => {
        expect(
            () =>
                new IntegratorFee(
                    Address.ZERO_ADDRESS,
                    Address.fromBigInt(2n),
                    Bps.ZERO,
                    Bps.ZERO
                )
        ).toThrow(/protocol address must be zero/)
    })

    it('rejects a non-zero fee with a zero integrator or protocol', () => {
        expect(
            () =>
                new IntegratorFee(
                    Address.ZERO_ADDRESS,
                    Address.fromBigInt(2n),
                    new Bps(10n),
                    Bps.fromPercent(50)
                )
        ).toThrow(/fee must be zero if integrator or protocol is zero/)
    })
})
