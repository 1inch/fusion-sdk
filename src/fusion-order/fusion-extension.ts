import {
    Address,
    Extension,
    ExtensionBuilder,
    Interaction,
    Bps,
    mulDiv,
    Rounding,
    FeeTakerExt
} from '@1inch/limit-order-sdk'
import {BN, BytesBuilder, BytesIter} from '@1inch/byte-utils'

import assert from 'assert'
import {AuctionDetails} from './auction-details'
import {Whitelist} from './whitelist/whitelist'

export class FusionExtension {
    /**
     * Flags for post-interaction data
     * @private
     */
    private static CUSTOM_RECEIVER_FLAG_BIT = 0n

    constructor(
        public readonly address: Address,
        public readonly auctionDetails: AuctionDetails,
        public readonly whitelist: Whitelist,
        public readonly extra?: {
            makerPermit?: Interaction
            customReceiver?: Address
            fees?: FeeTakerExt.Fees
        }
    ) {}

    /**
     * Create `FusionExtension` from bytes
     *
     * @param bytes 0x prefixed bytes
     */
    public static decode(bytes: string): FusionExtension {
        const extension = Extension.decode(bytes)

        return FusionExtension.fromExtension(extension)
    }

    /**
     * Create `FusionExtension` from `Extension`
     */
    public static fromExtension(extension: Extension): FusionExtension {
        const settlementContract = Address.fromFirstBytes(
            extension.makingAmountData
        )

        assert(
            Address.fromFirstBytes(extension.takingAmountData).equal(
                settlementContract
            ) &&
                Address.fromFirstBytes(extension.postInteraction).equal(
                    settlementContract
                ),
            'Invalid extension, all calls should be to the same address'
        )

        assert(
            extension.takingAmountData == extension.makingAmountData,
            'Invalid extension, taking amount data must be equal to making amount data'
        )

        // region Parse postInteraction data
        const interactionBytes = BytesIter.HexString(extension.postInteraction)
        interactionBytes.nextUint160() // skip address of extension
        const flags = BN.fromHex(interactionBytes.nextUint8())
        const integratorFeeRecipient = new Address(
            interactionBytes.nextUint160()
        )
        const protocolFeeRecipient = new Address(interactionBytes.nextUint160())

        const customReceiver = flags.getBit(
            FusionExtension.CUSTOM_RECEIVER_FLAG_BIT
        )
            ? new Address(interactionBytes.nextUint160())
            : undefined

        const interactionData = parseAmountData(interactionBytes)
        //endregion Parse postInteraction data

        //region Parse amount data
        const amountBytes = BytesIter.HexString(extension.makingAmountData)
        amountBytes.nextUint160() // skip address of extension

        const auctionDetails = AuctionDetails.decodeFrom(amountBytes)
        const amountData = parseAmountData(amountBytes)

        //endregion Parse amount data

        const makerPermit = extension.hasMakerPermit
            ? Interaction.decode(extension.makerPermit)
            : undefined

        assert(
            amountData.fees.integratorFee.value ===
                interactionData.fees.integratorFee.value,
            `invalid extension: integrator fee must be same in interaction data and in amount data`
        )
        assert(
            amountData.fees.resolverFee.value ===
                interactionData.fees.resolverFee.value,
            `invalid extension: resolver fee must be same in interaction data and in amount data`
        )

        assert(
            amountData.fees.whitelistDiscount.equal(
                interactionData.fees.whitelistDiscount
            ),
            `invalid extension: whitelistDiscount must be same in interaction data and in amount data`
        )

        assert(
            amountData.fees.integratorShare.value ===
                interactionData.fees.integratorShare.value,
            `invalid extension: integrator share must be same in interaction data and in amount data`
        )

        assert(
            interactionData.whitelist.equal(amountData.whitelist),
            'whitelist must be same in interaction data and in amount data'
        )

        const hasFees =
            !integratorFeeRecipient.isZero() || !protocolFeeRecipient.isZero()

        if (!hasFees) {
            return new FusionExtension(
                settlementContract,
                auctionDetails,
                interactionData.whitelist,
                {
                    makerPermit,
                    customReceiver
                }
            )
        }

        const fees = new FeeTakerExt.Fees(
            interactionData.fees.resolverFee.isZero()
                ? FeeTakerExt.ResolverFee.ZERO
                : new FeeTakerExt.ResolverFee(
                      protocolFeeRecipient,
                      interactionData.fees.resolverFee,
                      interactionData.fees.whitelistDiscount
                  ),
            interactionData.fees.integratorFee.isZero()
                ? FeeTakerExt.IntegratorFee.ZERO
                : new FeeTakerExt.IntegratorFee(
                      integratorFeeRecipient,
                      protocolFeeRecipient,
                      interactionData.fees.integratorFee,
                      interactionData.fees.integratorShare
                  )
        )

        return new FusionExtension(
            settlementContract,
            auctionDetails,
            interactionData.whitelist,
            {
                makerPermit,
                fees,
                customReceiver
            }
        )
    }

    public build(): Extension {
        const amountData = this.buildAmountGetterData(true)

        const builder = new ExtensionBuilder()
            .withMakingAmountData(this.address, amountData)
            .withTakingAmountData(this.address, amountData)
            .withPostInteraction(
                new Interaction(this.address, this.buildInteractionData())
            )

        if (this.extra?.makerPermit) {
            builder.withMakerPermit(
                this.extra?.makerPermit.target,
                this.extra?.makerPermit.data
            )
        }

        return builder.build()
    }

    /**
     * Build data for `FeeTaker.postInteraction`
     *
     *
     * 1 byte - flags:
     *      01 bit `CUSTOM_RECEIVER_FLAG` - set to 1 if order has custom receiver
     * 20 bytes — integrator fee recipient
     * 20 bytes - protocol fee recipient
     * [20 bytes] — receiver of taking tokens (optional, if not set, maker is used). See `CUSTOM_RECEIVER_FLAG` flag
     * Same as in `buildAmountGetterData`
     * @see buildAmountGetterData
     * @see https://github.com/1inch/limit-order-protocol/blob/22a18f7f20acfec69d4f50ce1880e8e662477710/contracts/extensions/FeeTaker.sol#L114
     */
    private buildInteractionData(): string {
        const customReceiver =
            this.extra?.customReceiver || Address.ZERO_ADDRESS

        const flags = new BN(0n).setBit(
            FusionExtension.CUSTOM_RECEIVER_FLAG_BIT,
            Boolean(!customReceiver.isZero())
        )

        const integratorReceiver =
            this.extra?.fees?.integrator.integrator || Address.ZERO_ADDRESS
        const protocolReceiver =
            this.extra?.fees?.protocol || Address.ZERO_ADDRESS

        const builder = new BytesBuilder()
            .addUint8(flags)
            .addAddress(integratorReceiver.toString())
            .addAddress(protocolReceiver.toString())

        if (!customReceiver.isZero()) {
            builder.addAddress(customReceiver.toString())
        }

        builder.addBytes(this.buildAmountGetterData(false))

        return builder.asHex()
    }

    /**
     * Build data for getMakingAmount/getTakingAmount
     *
     * AuctionDetails
     * 2 bytes — integrator fee percentage (in 1e5)
     * 1 byte - integrator share percentage (in 1e2)
     * 2 bytes — resolver fee percentage (in 1e5)
     * 1 byte - whitelist discount numerator (in 1e2)
     * Whitelist
     *
     * @see https://github.com/1inch/limit-order-settlement/blob/82f0a25c969170f710825ce6aa6920062adbde88/contracts/SimpleSettlement.sol#L34
     */
    private buildAmountGetterData(withAuction: boolean): string {
        const builder = new BytesBuilder()

        if (withAuction) {
            // auction data required only for `getMakingAmount/getTakingAmount` and not for `postInteraction`
            this.auctionDetails.encodeInto(builder)
        }

        const integrator = {
            fee:
                this.extra?.fees?.integrator.fee.toFraction(
                    FeeTakerExt.Fees.BASE_1E5
                ) || 0,
            share:
                this.extra?.fees?.integrator.share.toFraction(
                    FeeTakerExt.Fees.BASE_1E2
                ) || 0
        }

        const resolverFee =
            this.extra?.fees?.resolver.fee.toFraction(
                FeeTakerExt.Fees.BASE_1E5
            ) || 0
        const whitelistDiscount =
            this.extra?.fees?.resolver.whitelistDiscount || Bps.ZERO

        builder
            .addUint16(BigInt(integrator.fee))
            .addUint8(BigInt(integrator.share))
            .addUint16(BigInt(resolverFee))
            .addUint8(
                BigInt(
                    // contract expects discount numerator, but class contain discount
                    Number(FeeTakerExt.Fees.BASE_1E2) -
                        whitelistDiscount.toFraction(FeeTakerExt.Fees.BASE_1E2)
                )
            )

        this.whitelist.encodeInto(builder)

        return builder.asHex()
    }

    private getFeesForTaker(taker: Address): {
        resolverFee: bigint
        integratorFee: bigint
    } {
        const whitelistDiscount =
            this.extra?.fees?.resolver.whitelistDiscount.toFraction(
                FeeTakerExt.Fees.BASE_1E2
            ) || 0

        const discountNumerator = this.whitelist.isWhitelisted(taker)
            ? (Number(FeeTakerExt.Fees.BASE_1E2) - whitelistDiscount) /
              Number(FeeTakerExt.Fees.BASE_1E2)
            : 1

        const resolverFee =
            discountNumerator *
            (this.extra?.fees?.resolver.fee.toFraction(
                FeeTakerExt.Fees.BASE_1E5
            ) || 0)

        const resolverFeeBN = BigInt(resolverFee)
        const integratorFeeBN = BigInt(
            this.extra?.fees?.integrator.fee.toFraction(
                FeeTakerExt.Fees.BASE_1E5
            ) || 0
        )

        return {
            resolverFee: resolverFeeBN,
            integratorFee: integratorFeeBN
        }
    }

    /**
     * Returns takingAmount with fee, but without auction bump
     * @param taker
     * @param orderTakingAmount
     * @private
     */
    private getTakingAmountWithFee(
        taker: Address,
        orderTakingAmount: bigint
    ): bigint {
        const fees = this.getFeesForTaker(taker)

        return mulDiv(
            orderTakingAmount,
            FeeTakerExt.Fees.BASE_1E5 + fees.resolverFee + fees.integratorFee,
            FeeTakerExt.Fees.BASE_1E5,
            Rounding.Ceil
        )
    }
}

function parseAmountData(iter: BytesIter<string>): {
    fees: {
        integratorFee: Bps
        integratorShare: Bps
        resolverFee: Bps
        whitelistDiscount: Bps
    }
    whitelist: Whitelist
} {
    const fees = {
        integratorFee: Bps.fromFraction(
            Number(iter.nextUint16()),
            FeeTakerExt.Fees.BASE_1E5
        ),
        integratorShare: Bps.fromFraction(
            Number(iter.nextUint8()),
            FeeTakerExt.Fees.BASE_1E2
        ),
        resolverFee: Bps.fromFraction(
            Number(iter.nextUint16()),
            FeeTakerExt.Fees.BASE_1E5
        ),
        whitelistDiscount: Bps.fromFraction(
            Number(FeeTakerExt.Fees.BASE_1E2) - Number(iter.nextUint8()), // contract uses 1 - discount
            FeeTakerExt.Fees.BASE_1E2
        )
    }

    const whitelist = Whitelist.decodeFrom(iter)

    return {
        fees,
        whitelist
    }
}
