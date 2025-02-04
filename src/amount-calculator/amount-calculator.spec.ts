import {
    FeeCalculator,
    Fees,
    IntegratorFee
} from '@1inch/limit-order-sdk/extensions/fee-taker'
import {Address, Bps} from '@1inch/limit-order-sdk'
import {AmountCalculator} from './amount-calculator'
import {AuctionCalculator} from './auction-calculator'
import {Whitelist} from '../fusion-order'
import {now} from '../utils/time'

describe('AmountCalculator', () => {
    it('should correct extract fee', () => {
        const integratorFeeBps = new Bps(6n) // 60% from 10bps
        const calculator = new AmountCalculator(
            new AuctionCalculator(
                1738650250n,
                180n,
                1218519n,
                [{coefficient: 609353, delay: 180}],
                {gasBumpEstimate: 609353n, gasPriceEstimate: 1526n}
            ),
            new FeeCalculator(
                Fees.integratorFee(
                    new IntegratorFee(
                        new Address(
                            '0x8e097e5e0493de033270a01b324caf31f464dc67'
                        ),
                        new Address(
                            '0x90cbe4bdd538d6e9b379bff5fe72c3d67a521de5'
                        ),
                        new Bps(10n),
                        new Bps(6000n)
                    )
                ),
                Whitelist.new(1738650226n, [
                    {address: Address.fromBigInt(1n), allowFrom: 0n}
                ])
            )
        )
        const takingAmount = 100000n
        const requiredTakingAmount = calculator.getRequiredTakingAmount(
            Address.ZERO_ADDRESS,
            takingAmount,
            now(),
            10n
        )

        const integratorFee = calculator.getIntegratorFee(
            Address.ZERO_ADDRESS,
            takingAmount,
            now(),
            10n
        )

        expect(
            AmountCalculator.extractFeeAmount(
                requiredTakingAmount,
                integratorFeeBps
            )
        ).toEqual(integratorFee)
    })
})
