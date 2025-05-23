import {
    Address,
    Bps,
    FeeTakerExt,
    mulDiv,
    Rounding
} from '@1inch/limit-order-sdk'
import {FeeCalculator, Fees} from '@1inch/limit-order-sdk/extensions/fee-taker'
import {AuctionCalculator} from './auction-calculator'
import {FusionExtension, SurplusParams} from '../fusion-order'

/**
 * Calculates fees/amount with accounting to auction
 *
 * @see FusionOrder
 */
export class AmountCalculator {
    constructor(
        private readonly auctionCalculator: AuctionCalculator,
        private readonly feeCalculator?: FeeCalculator,
        private readonly surplus = SurplusParams.NO_FEE
    ) {}

    static fromExtension(ext: FusionExtension): AmountCalculator {
        return new AmountCalculator(
            AuctionCalculator.fromAuctionData(ext.auctionDetails),
            ext.extra?.fees
                ? new FeeTakerExt.FeeCalculator(ext.extra?.fees, ext.whitelist)
                : undefined,
            ext.surplus
        )
    }

    /**
     * Returns amount with applied rate bump and fees
     *
     * @param baseTakingAmount base amount to apply bump to
     * @param rate auction rate bump
     * @param fee all fees applied to amount
     *
     * @see AuctionCalculator.calcInitialRateBump
     */
    static calcAuctionTakingAmount(
        baseTakingAmount: bigint,
        rate: number,
        fee: Bps = Bps.ZERO
    ): bigint {
        const withoutFee = AuctionCalculator.calcAuctionTakingAmount(
            baseTakingAmount,
            rate
        )

        if (fee.isZero()) {
            return withoutFee
        }

        const numerator = Fees.BASE_1E5 + BigInt(fee.toFraction(Fees.BASE_1E5))

        return (withoutFee * numerator) / Fees.BASE_1E5
    }

    /**
     * Return fee amount in taker asset which is included in `requiredTakingAmount`
     *
     * @param requiredTakingAmount must already contain fee
     * @param fee to extract
     */
    public static extractFeeAmount(
        requiredTakingAmount: bigint,
        fee: Bps
    ): bigint {
        return (
            requiredTakingAmount -
            mulDiv(
                requiredTakingAmount,
                Fees.BASE_1E5,
                Fees.BASE_1E5 + BigInt(fee.toFraction(Fees.BASE_1E5)),
                Rounding.Ceil
            )
        )
    }

    /**
     * Returns adjusted taking amount with included fees and auction bump
     *
     * @param taker address which fill order
     * @param takingAmount base taking amount without auction and fee
     * @param time block time at which order will be filled
     * @param blockBaseFee base fee of block at which order will be filled
     */
    public getRequiredTakingAmount(
        taker: Address,
        takingAmount: bigint,
        time: bigint,
        blockBaseFee = 0n
    ): bigint {
        const withFee =
            this.feeCalculator?.getTakingAmount(taker, takingAmount) ??
            takingAmount

        return this.getAuctionBumpedAmount(withFee, time, blockBaseFee)
    }

    /**
     * Returns adjusted making amount with accounting of fees and auction bump
     *
     * @param taker address which fill order
     * @param makingAmount base making amount without auction and fee
     * @param time block time at which order will be filled
     * @param blockBaseFee base fee of block at which order will be filled
     */
    public getRequiredMakingAmount(
        taker: Address,
        makingAmount: bigint,
        time: bigint,
        blockBaseFee = 0n
    ): bigint {
        const withFee =
            this.feeCalculator?.getMakingAmount(taker, makingAmount) ??
            makingAmount

        const rateBump = this.auctionCalculator.calcRateBump(time, blockBaseFee)

        return AuctionCalculator.calcAuctionMakingAmount(withFee, rateBump)
    }

    /**
     * Returns total fee = integrator + protocol
     *
     * @param taker
     * @param takingAmount base taking amount without auction and fee
     * @param time block time at which order will be filled
     * @param blockBaseFee base fee of block at which order will be filled
     */
    public getTotalFee(
        taker: Address,
        takingAmount: bigint,
        time: bigint,
        blockBaseFee = 0n
    ): bigint {
        return (
            this.getIntegratorFee(taker, takingAmount, time, blockBaseFee) +
            this.getProtocolFee(taker, takingAmount, time, blockBaseFee)
        )
    }

    /**
     * Returns amount which will receive user
     *
     * @param taker
     * @param makingAmount amount to be filled
     * @param takingAmount base taking amount without auction and fee
     * @param orderMakingAmount full order making amount
     * @param time block time at which order will be filled
     * @param blockBaseFee base fee of block at which order will be filled
     */
    public getUserTakingAmountAmount(
        taker: Address,
        makingAmount: bigint,
        takingAmount: bigint,
        orderMakingAmount: bigint,
        time: bigint,
        blockBaseFee = 0n
    ): bigint {
        const whole = this.getRequiredTakingAmount(
            taker,
            takingAmount,
            time,
            blockBaseFee
        )

        const preSurplus =
            whole - this.getTotalFee(taker, takingAmount, time, blockBaseFee)

        const surplusFee = this._getSurplusFee(
            preSurplus,
            makingAmount,
            orderMakingAmount
        )

        return preSurplus - surplusFee
    }

    /**
     * Returns amount in taker asset which sent to protocol as part of surplus share
     *
     * @param taker
     * @param makingAmount amount to be filled
     * @param takingAmount base taking amount without auction and fee
     * @param orderMakingAmount full order making amount
     * @param time block time at which order will be filled
     * @param blockBaseFee base fee of block at which order will be filled
     */
    public getSurplusFee(
        taker: Address,
        makingAmount: bigint,
        takingAmount: bigint,
        orderMakingAmount: bigint,
        time: bigint,
        blockBaseFee = 0n
    ): bigint {
        const whole = this.getRequiredTakingAmount(
            taker,
            takingAmount,
            time,
            blockBaseFee
        )

        const preSurplus =
            whole - this.getTotalFee(taker, takingAmount, time, blockBaseFee)

        return this._getSurplusFee(preSurplus, makingAmount, orderMakingAmount)
    }

    /**
     * Fee in `takerAsset` which resolver pays to resolver fee receiver
     *
     * @param taker who will fill order
     * @param takingAmount taking amount to calculate fee from, must be without fees/auction adjustments
     * @param time block time at which order will be filled
     * @param blockBaseFee base fee of block at which order will be filled
     */
    public getResolverFee(
        taker: Address,
        takingAmount: bigint,
        time: bigint,
        blockBaseFee = 0n
    ): bigint {
        return (
            this.feeCalculator?.getResolverFee(
                taker,
                this.getAuctionBumpedAmount(takingAmount, time, blockBaseFee)
            ) ?? 0n
        )
    }

    /**
     * Fee in `takerAsset` which integrator gets to integrator wallet
     *
     * @param taker who will fill order
     * @param takingAmount taking amount to calculate fee from, must be without fees/auction adjustments
     * @param time block time at which order will be filled
     * @param blockBaseFee base fee of block at which order will be filled
     */
    public getIntegratorFee(
        taker: Address,
        takingAmount: bigint,
        time: bigint,
        blockBaseFee = 0n
    ): bigint {
        return (
            this.feeCalculator?.getIntegratorFee(
                taker,
                this.getAuctionBumpedAmount(takingAmount, time, blockBaseFee)
            ) ?? 0n
        )
    }

    /**
     * Fee in `takerAsset` which protocol gets as share from integrator fee
     *
     * @param taker who will fill order
     * @param takingAmount taking amount to calculate fee from, must be without fees/auction adjustments
     * @param time block time at which order will be filled
     * @param blockBaseFee base fee of block at which order will be filled
     */
    public getProtocolShareOfIntegratorFee(
        taker: Address,
        takingAmount: bigint,
        time: bigint,
        blockBaseFee = 0n
    ): bigint {
        return (
            this.feeCalculator?.getProtocolShareOfIntegratorFee(
                taker,
                this.getAuctionBumpedAmount(takingAmount, time, blockBaseFee)
            ) ?? 0n
        )
    }

    /**
     * Fee in `takerAsset` which protocol gets
     * It equals to `share from integrator fee plus resolver fee`
     *
     * @param taker who will fill order
     * @param takingAmount taking amount to calculate fee from, must be without fees/auction adjustments
     * @param time block time at which order will be filled
     * @param blockBaseFee base fee of block at which order will be filled
     */
    public getProtocolFee(
        taker: Address,
        takingAmount: bigint,
        time: bigint,
        blockBaseFee = 0n
    ): bigint {
        return (
            this.feeCalculator?.getProtocolFee(
                taker,
                this.getAuctionBumpedAmount(takingAmount, time, blockBaseFee)
            ) ?? 0n
        )
    }

    /**
     * Calculates surplus fee. It will be sent to the same address as `protocolFee`
     *
     * @param userTakingAmount how much user would receive without surplus
     * @param makingAmount making amount to be filled
     * @param orderMakingAmount full order making amount
     */
    private _getSurplusFee(
        userTakingAmount: bigint,
        makingAmount: bigint,
        orderMakingAmount: bigint
    ): bigint {
        const estimatedTakingAmount = mulDiv(
            this.surplus.estimatedTakerAmount,
            makingAmount,
            orderMakingAmount
        )

        if (userTakingAmount > estimatedTakingAmount) {
            const surplusFee =
                ((userTakingAmount - estimatedTakingAmount) *
                    BigInt(this.surplus.protocolFee.toPercent())) /
                100n

            return surplusFee
        }

        return 0n
    }

    private getAuctionBumpedAmount(
        takingAmount: bigint,
        time: bigint,
        blockBaseFee = 0n
    ): bigint {
        const rateBump = this.auctionCalculator.calcRateBump(time, blockBaseFee)

        return AuctionCalculator.calcAuctionTakingAmount(takingAmount, rateBump)
    }
}
