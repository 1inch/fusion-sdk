import {FusionExtension} from './fusion-extension'
import assert from 'assert'
import {AuctionCalculator} from '../auction-calculator'
import {AuctionDetails} from './auction-details'
import {
    AuctionWhitelistItem,
    IntegratorFee,
    SettlementPostInteractionData
} from './settlement-post-interaction-data'
import {add0x} from '../utils'
import {ZX} from '../constants'
import {
    Address,
    EIP712TypedData,
    Extension,
    getLimitOrderV4Domain,
    LimitOrder,
    LimitOrderV4Struct,
    MakerTraits,
    OrderInfoData
} from '@1inch/limit-order-sdk'

export class FusionOrder {
    private static defaultExtra = {
        allowPartialFills: true,
        allowMultipleFills: true,
        unwrapWETH: false,
        enablePermit2: false,
        orderExpirationDelay: 12n
    }

    public readonly fusionExtension: FusionExtension

    private inner: LimitOrder

    private constructor(
        /**
         * Fusion extension address
         * @see https://github.com/1inch/limit-order-settlement
         */
        extensionContract: Address,
        orderInfo: OrderInfoData,
        auctionDetails: AuctionDetails,
        postInteractionData: SettlementPostInteractionData,
        extra: {
            unwrapWETH?: boolean
            /**
             * Required if `allowPartialFills` is false
             */
            nonce?: bigint
            permit?: string
            /**
             * Default is true
             */
            allowPartialFills?: boolean

            /**
             * Default is true
             */
            allowMultipleFills?: boolean
            /**
             * Order will expire in `orderExpirationDelay` after auction ends
             * Default 12s
             */
            orderExpirationDelay?: bigint
            enablePermit2?: boolean
        } = FusionOrder.defaultExtra
    ) {
        const {
            allowPartialFills,
            allowMultipleFills,
            unwrapWETH,
            enablePermit2,
            orderExpirationDelay,
            nonce,
            permit
        } = {
            ...FusionOrder.defaultExtra,
            ...extra
        }

        const deadline =
            auctionDetails.startTime +
            auctionDetails.duration +
            orderExpirationDelay

        const makerTraits = MakerTraits.default()
            .withExpiration(deadline)
            .setPartialFills(allowPartialFills)
            .setMultipleFills(allowMultipleFills)

        if (makerTraits.isBitInvalidatorMode()) {
            assert(
                nonce !== undefined,
                'Nonce required, when partial fill or multiple fill disallowed'
            )
        }

        if (unwrapWETH) {
            makerTraits.enableNativeUnwrap()
        }

        if (enablePermit2) {
            makerTraits.enablePermit2()
        }

        if (nonce !== undefined) {
            makerTraits.withNonce(nonce)
        }

        const extension = new FusionExtension(
            extensionContract,
            auctionDetails,
            postInteractionData
        )

        if (permit) {
            extension.withMakerPermit(orderInfo.makerAsset, permit)
        }

        const builtExtension = extension.build()

        this.inner = new LimitOrder(
            {
                ...orderInfo,
                salt: LimitOrder.buildSalt(builtExtension, orderInfo.salt)
            },
            makerTraits,
            builtExtension
        )

        this.fusionExtension = extension
    }

    static new(
        /**
         * Fusion extension address
         * @see https://github.com/1inch/limit-order-settlement
         */
        settlementExtension: Address,
        orderInfo: OrderInfoData,
        details: {
            auction: AuctionDetails
            fees?: {
                integratorFee?: IntegratorFee
                bankFee?: bigint
            }
            whitelist: AuctionWhitelistItem[]
        },
        extra: {
            unwrapWETH?: boolean
            /**
             * Required if `allowPartialFills` is false
             */
            nonce?: bigint
            permit?: string
            /**
             * Default is true
             */
            allowPartialFills?: boolean

            /**
             * Default is true
             */
            allowMultipleFills?: boolean
            /**
             * Order will expire in `orderExpirationDelay` after auction ends
             * Default 12s
             */
            orderExpirationDelay?: bigint
            enablePermit2?: boolean
        } = FusionOrder.defaultExtra
    ): FusionOrder {
        return new FusionOrder(
            settlementExtension,
            orderInfo,
            details.auction,
            SettlementPostInteractionData.new({
                bankFee: details.fees?.bankFee || 0n,
                integratorFee: details.fees?.integratorFee,
                whitelist: details.whitelist,
                auctionStartTime: details.auction.startTime
            }),
            extra
        )
    }

    /**
     * Create FusionOrder from order data and extension
     *
     */
    static fromDataAndExtension(
        order: LimitOrderV4Struct,
        extension: Extension
    ): FusionOrder {
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

        const makerTraits = new MakerTraits(BigInt(order.makerTraits))

        const auctionDetails = AuctionDetails.decode(
            add0x(extension.makingAmountData.slice(42))
        )

        const postInteractionData = SettlementPostInteractionData.decode(
            add0x(extension.postInteraction.slice(42))
        )

        const deadline = makerTraits.expiration()

        const orderExpirationDelay =
            deadline === null
                ? undefined
                : deadline - auctionDetails.startTime - auctionDetails.duration

        return new FusionOrder(
            settlementContract,
            {
                // shift because of how LimitOrder.buildSalt works
                salt: BigInt(order.salt) >> 160n,
                maker: new Address(order.maker),
                receiver: new Address(order.receiver),
                makerAsset: new Address(order.makerAsset),
                takerAsset: new Address(order.takerAsset),
                makingAmount: BigInt(order.makingAmount),
                takingAmount: BigInt(order.takingAmount)
            },
            auctionDetails,
            postInteractionData,
            {
                allowMultipleFills: makerTraits.isMultipleFillsAllowed(),
                allowPartialFills: makerTraits.isPartialFillAllowed(),
                enablePermit2: makerTraits.isPermit2(),
                nonce: makerTraits.nonceOrEpoch(),
                permit:
                    extension.makerPermit === ZX
                        ? undefined
                        : extension.makerPermit,
                unwrapWETH: makerTraits.isNativeUnwrapEnabled(),
                orderExpirationDelay
            }
        )
    }

    public build(): LimitOrderV4Struct {
        return this.inner.build()
    }

    public getOrderHash(domain = getLimitOrderV4Domain(1)): string {
        return this.inner.getOrderHash(domain)
    }

    public getTypedData(domain = getLimitOrderV4Domain(1)): EIP712TypedData {
        return this.inner.getTypedData(domain)
    }

    public getCalculator(): AuctionCalculator {
        return AuctionCalculator.fromAuctionData(
            this.fusionExtension.postInteractionData,
            this.fusionExtension.details
        )
    }

    get extension(): Extension {
        return this.inner.extension
    }
}
