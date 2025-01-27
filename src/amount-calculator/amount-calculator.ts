import {Address, FeeTakerExt} from '@1inch/limit-order-sdk'
import {FeeCalculator} from '@1inch/limit-order-sdk/extensions/fee-taker'
import {AuctionCalculator} from './auction-calculator'
import {FusionExtension} from '../fusion-order'

export class AmountCalculator {
    constructor(
        private readonly auctionCalculator: AuctionCalculator,
        private readonly feeCalculator?: FeeCalculator
    ) {}

    static fromExtension(ext: FusionExtension): AmountCalculator {
        return new AmountCalculator(
            AuctionCalculator.fromAuctionData(ext.auctionDetails),
            ext.extra?.fees
                ? new FeeTakerExt.FeeCalculator(ext.extra?.fees, ext.whitelist)
                : undefined
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
     * @param takingAmount base taking amount without auction and fee
     * @param time block time at which order will be filled
     * @param blockBaseFee base fee of block at which order will be filled
     */
    public getUserTakingAmountAmount(
        taker: Address,
        takingAmount: bigint,
        time: bigint,
        blockBaseFee = 0n
    ): bigint {
        const whole = this.getRequiredTakingAmount(
            taker,
            takingAmount,
            time,
            blockBaseFee
        )

        return whole - this.getTotalFee(taker, takingAmount, time, blockBaseFee)
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

    private getAuctionBumpedAmount(
        takingAmount: bigint,
        time: bigint,
        blockBaseFee = 0n
    ): bigint {
        const rateBump = this.auctionCalculator.calcRateBump(time, blockBaseFee)

        return AuctionCalculator.calcAuctionTakingAmount(takingAmount, rateBump)
    }
}
