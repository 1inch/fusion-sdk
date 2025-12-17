import {FeeTakerExt, Address, Bps} from '@1inch/limit-order-sdk'
import {AmountCalculator} from './amount-calculator.js'
import {AuctionCalculator} from './auction-calculator/index.js'
import {SurplusParams, Whitelist} from '../fusion-order/index.js'
import {now} from '../utils/time.js'
import {Fees, IntegratorFee} from '../fusion-order/fees/index.js'

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
            new FeeTakerExt.FeeCalculator(
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

    it('should apply surplus', () => {
        const startTime = 1738650250n
        const execTime = startTime + 180n // end of auction
        const auction = new AuctionCalculator(
            startTime,
            180n,
            1218519n,
            [{coefficient: 609353, delay: 180}],
            {gasBumpEstimate: 609353n, gasPriceEstimate: 1526n}
        )
        const taker = Address.fromBigInt(1n)
        const feeCalculator = new FeeTakerExt.FeeCalculator(
            Fees.integratorFee(
                new IntegratorFee(
                    new Address('0x8e097e5e0493de033270a01b324caf31f464dc67'),
                    new Address('0x90cbe4bdd538d6e9b379bff5fe72c3d67a521de5'),
                    new Bps(10n),
                    new Bps(6000n)
                )
            ),
            Whitelist.new(1738650226n, [{address: taker, allowFrom: 0n}])
        )

        const calculatorNoSurplusFee = new AmountCalculator(
            auction,
            feeCalculator
        )
        const takingAmount = 100000n
        const makingAmount = 1000n
        const surplus = takingAmount / 3n
        const estimatedTakingAmount = takingAmount - surplus

        const calculator = new AmountCalculator(
            auction,
            feeCalculator,
            new SurplusParams(estimatedTakingAmount, Bps.fromPercent(50))
        )

        const userAmount = calculatorNoSurplusFee.getUserTakingAmount(
            taker,
            makingAmount,
            takingAmount,
            makingAmount,
            execTime
        )

        const userAmountWithChargedSurplus = calculator.getUserTakingAmount(
            taker,
            makingAmount,
            takingAmount,
            makingAmount,
            execTime
        )

        expect(userAmount).toBeGreaterThan(userAmountWithChargedSurplus)
        expect(userAmount - userAmountWithChargedSurplus).toEqual(surplus / 2n) // fee is 50%
    })

    it('should apply surplus with correct rounding', () => {
        const startTime = 1764548287n
        const execTime = startTime

        const auction = new AuctionCalculator(
            startTime,
            600n,
            179149n,
            [
                {coefficient: 157277, delay: 84},
                {coefficient: 141862, delay: 84},
                {coefficient: 129415, delay: 84},
                {coefficient: 116876, delay: 84},
                {coefficient: 24, delay: 264}
            ],
            {gasBumpEstimate: 24n, gasPriceEstimate: 221n}
        )

        const taker = Address.fromBigInt(1n)
        const feeCalculator = new FeeTakerExt.FeeCalculator(
            Fees.integratorFee(
                new IntegratorFee(
                    new Address('0x0000000000000000000000000000000000000000'),
                    new Address('0x0000000000000000000000000000000000000000'),
                    new Bps(0n),
                    new Bps(0n)
                )
            ),
            Whitelist.new(1764548263n, [{address: taker, allowFrom: 0n}])
        )

        const makingAmountOrder = 1369521200000n

        const calculator = new AmountCalculator(
            auction,
            feeCalculator,
            new SurplusParams(107289453867377650931124n, Bps.fromPercent(90))
        )

        const userAmount1 = calculator.getSurplusFee(
            taker,
            982226837n,
            76145644627284979970n,
            makingAmountOrder,
            execTime,
            216836903n
        )

        expect(userAmount1).toBe(505013885259508359n)

        const userAmount2 = calculator.getSurplusFee(
            taker,
            136853897316n,
            10609390660421433527440n,
            makingAmountOrder,
            execTime + 4n,
            242000680n
        )

        expect(userAmount2).toBe(69365890784904718356n)
    })
})
