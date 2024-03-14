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
import assert from 'assert'
import {FusionExtension} from './fusion-extension'
import {AuctionDetails} from './auction-details'
import {
    AuctionWhitelistItem,
    IntegratorFee,
    SettlementPostInteractionData
} from './settlement-post-interaction-data'
import {AuctionCalculator} from '../auction-calculator'
import {add0x} from '../utils'
import {ZX} from '../constants'
import {calcTakingAmount} from '../utils/amounts'
import {now} from '../utils/time'

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
            /**
             * 0x prefixed without the token address
             */
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

    get extension(): Extension {
        return this.inner.extension
    }

    get maker(): Address {
        return this.inner.maker
    }

    get takerAsset(): Address {
        return this.inner.takerAsset
    }

    get makerAsset(): Address {
        return this.inner.makerAsset
    }

    get takingAmount(): bigint {
        return this.inner.takingAmount
    }

    get makingAmount(): bigint {
        return this.inner.makingAmount
    }

    get receiver(): Address {
        return this.inner.receiver
    }

    /**
     * Timestamp in sec
     */
    get deadline(): bigint {
        return this.inner.makerTraits.expiration() || 0n
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
                resolvingStartTime: now()
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

    /**
     * Calculates required taking amount for passed `makingAmount` at block time `time`
     *
     * @param makingAmount maker swap amount
     * @param time execution time in sec
     * @param blockBaseFee block fee in wei.
     * */
    public calcTakingAmount(
        makingAmount: bigint,
        time: bigint,
        blockBaseFee = 0n
    ): bigint {
        const takingAmount = calcTakingAmount(
            makingAmount,
            this.makingAmount,
            this.takingAmount
        )

        const calculator = this.getCalculator()

        const bump = calculator.calcRateBump(time, blockBaseFee)

        return calculator.calcAuctionTakingAmount(takingAmount, bump)
    }

    /**
     * Check whether address allowed to execute order at the given time
     *
     * @param executor address of executor
     * @param executionTime timestamp in sec at which order planning to execute
     */
    public canExecuteAt(executor: Address, executionTime: bigint): boolean {
        return this.fusionExtension.postInteractionData.canExecuteAt(
            executor,
            executionTime
        )
    }
}
