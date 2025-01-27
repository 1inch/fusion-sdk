import {
    Address,
    EIP712TypedData,
    Extension,
    Interaction,
    LimitOrder,
    LimitOrderV4Struct,
    MakerTraits,
    OrderInfoData,
    FeeTakerExt
} from '@1inch/limit-order-sdk'
import assert from 'assert'
import {FusionExtension} from './fusion-extension'
import {AuctionDetails} from './auction-details'

import {injectTrackCode} from './source-track'
import {Whitelist} from './whitelist/whitelist'
import {AuctionCalculator} from '../amount-calculator/auction-calculator'
import {ZX} from '../constants'
import {calcTakingAmount} from '../utils/amounts'
import {now} from '../utils/time'
import {AmountCalculator} from '../amount-calculator/amount-calculator'

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

    protected constructor(
        /**
         * Fusion extension address
         * @see https://github.com/1inch/limit-order-settlement
         */
        public readonly settlementExtensionContract: Address,
        orderInfo: OrderInfoData,
        auctionDetails: AuctionDetails,
        whitelist: Whitelist,
        extra: {
            unwrapWETH?: boolean
            /**
             * Required if `allowPartialFills` or `allowMultipleFills` is false
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
            source?: string
            fees?: FeeTakerExt.Fees
        } = FusionOrder.defaultExtra,
        extension = new FusionExtension(
            settlementExtensionContract,
            auctionDetails,
            whitelist,
            {
                makerPermit: extra.permit
                    ? new Interaction(orderInfo.makerAsset, extra.permit)
                    : undefined,
                customReceiver: orderInfo.receiver,
                fees: extra?.fees
            }
        )
    ) {
        const allowPartialFills =
            extra.allowPartialFills ??
            FusionOrder.defaultExtra.allowPartialFills
        const allowMultipleFills =
            extra.allowMultipleFills ??
            FusionOrder.defaultExtra.allowMultipleFills
        const unwrapWETH =
            extra.unwrapWETH ?? FusionOrder.defaultExtra.unwrapWETH
        const enablePermit2 =
            extra.enablePermit2 ?? FusionOrder.defaultExtra.enablePermit2
        const orderExpirationDelay =
            extra.orderExpirationDelay ??
            FusionOrder.defaultExtra.orderExpirationDelay

        const deadline =
            auctionDetails.startTime +
            auctionDetails.duration +
            orderExpirationDelay

        const makerTraits = MakerTraits.default()
            .withExpiration(deadline)
            .setPartialFills(allowPartialFills)
            .setMultipleFills(allowMultipleFills)
            .enablePostInteraction()

        if (makerTraits.isBitInvalidatorMode()) {
            assert(
                extra.nonce !== undefined,
                'Nonce required, when partial fill or multiple fill disallowed'
            )
        }

        if (unwrapWETH) {
            makerTraits.enableNativeUnwrap()
        }

        if (enablePermit2) {
            makerTraits.enablePermit2()
        }

        if (extra.nonce !== undefined) {
            makerTraits.withNonce(extra.nonce)
        }

        /**
         * @see https://github.com/1inch/limit-order-settlement/blob/0afb4785cb825fe959c534ff4f1a771d4d33cdf4/contracts/extensions/IntegratorFeeExtension.sol#L65
         */
        const receiver = extra.fees
            ? settlementExtensionContract
            : orderInfo.receiver

        const builtExtension = extension.build()
        const salt = LimitOrder.buildSalt(builtExtension, orderInfo.salt)
        const saltWithInjectedTrackCode = orderInfo.salt
            ? salt
            : injectTrackCode(salt, extra.source)

        this.inner = new LimitOrder(
            {
                ...orderInfo,
                receiver,
                salt: saltWithInjectedTrackCode
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

    /**
     * Timestamp in sec
     */
    get auctionStartTime(): bigint {
        return this.fusionExtension.auctionDetails.startTime
    }

    /**
     * Timestamp in sec
     */
    get auctionEndTime(): bigint {
        const {startTime, duration} = this.fusionExtension.auctionDetails

        return startTime + duration
    }

    get isBitInvalidatorMode(): boolean {
        return this.inner.makerTraits.isBitInvalidatorMode()
    }

    get partialFillAllowed(): boolean {
        return this.inner.makerTraits.isPartialFillAllowed()
    }

    get multipleFillsAllowed(): boolean {
        return this.inner.makerTraits.isMultipleFillsAllowed()
    }

    get nonce(): bigint {
        return this.inner.makerTraits.nonceOrEpoch()
    }

    get salt(): bigint {
        return this.inner.salt
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
            whitelist: Whitelist
        },
        extra?: {
            unwrapWETH?: boolean
            /**
             * Required if `allowPartialFills` or `allowMultipleFills` is false
             * Max size is 40bit
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
            source?: string
            fees?: FeeTakerExt.Fees
        }
    ): FusionOrder {
        return new FusionOrder(
            settlementExtension,
            orderInfo,
            details.auction,
            details.whitelist,
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

        assert(!makerTraits.isPrivate(), 'fusion order can not be private')
        assert(
            makerTraits.hasPostInteraction(),
            'post-interaction must be enabled'
        )

        const {auctionDetails, whitelist, extra} =
            FusionExtension.fromExtension(extension)

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
                receiver: extra?.customReceiver,
                makerAsset: new Address(order.makerAsset),
                takerAsset: new Address(order.takerAsset),
                makingAmount: BigInt(order.makingAmount),
                takingAmount: BigInt(order.takingAmount)
            },
            auctionDetails,
            whitelist,
            {
                allowMultipleFills: makerTraits.isMultipleFillsAllowed(),
                allowPartialFills: makerTraits.isPartialFillAllowed(),
                enablePermit2: makerTraits.isPermit2(),
                nonce: makerTraits.nonceOrEpoch(),
                permit:
                    extension.makerPermit === ZX
                        ? undefined
                        : Interaction.decode(extension.makerPermit).data,
                unwrapWETH: makerTraits.isNativeUnwrapEnabled(),
                orderExpirationDelay,
                fees: extra?.fees
            }
        )
    }

    public build(): LimitOrderV4Struct {
        return this.inner.build()
    }

    public getOrderHash(chainId: number): string {
        return this.inner.getOrderHash(chainId)
    }

    public getTypedData(chainId: number): EIP712TypedData {
        return this.inner.getTypedData(chainId)
    }

    public getCalculator(): AuctionCalculator {
        return AuctionCalculator.fromAuctionData(
            this.fusionExtension.auctionDetails
        )
    }

    /**
     * Calculates required taking amount for passed `makingAmount` at block time `time`
     *
     * @param taker address who fill order
     * @param time execution time in sec
     * @param blockBaseFee block fee in wei.
     * @param makingAmount maker swap amount
     * */
    public calcTakingAmount(
        taker: Address,
        makingAmount: bigint,
        time: bigint,
        blockBaseFee = 0n
    ): bigint {
        const takingAmount = calcTakingAmount(
            makingAmount,
            this.makingAmount,
            this.takingAmount
        )

        return this.getAmountCalculator().getTakingAmount(
            taker,
            takingAmount,
            time,
            blockBaseFee
        )
    }

    /**
     * Fee in `takerAsset` which resolver pays to resolver fee receiver
     *
     * @param taker who will fill order
     * @param makingAmount maker swap amount
     */
    public getResolverFee(
        taker: Address,
        makingAmount = this.makingAmount
    ): bigint {
        const takingAmount = calcTakingAmount(
            makingAmount,
            this.makingAmount,
            this.takingAmount
        )

        return (
            this.getAmountCalculator().getResolverFee(taker, takingAmount) ?? 0n
        )
    }

    /**
     * Fee in `takerAsset` which integrator gets to integrator wallet
     *
     * @param taker who will fill order
     * @param makingAmount maker swap amount
     */
    public getIntegratorFee(
        taker: Address,
        makingAmount = this.makingAmount
    ): bigint {
        const takingAmount = calcTakingAmount(
            makingAmount,
            this.makingAmount,
            this.takingAmount
        )

        return (
            this.getAmountCalculator().getIntegratorFee(taker, takingAmount) ??
            0n
        )
    }

    /**
     * Fee in `takerAsset` which protocol gets as share from integrator fee
     *
     * @param taker who will fill order
     * @param makingAmount maker swap amount
     */
    public getProtocolShareOfIntegratorFee(
        taker: Address,
        makingAmount = this.makingAmount
    ): bigint {
        const takingAmount = calcTakingAmount(
            makingAmount,
            this.makingAmount,
            this.takingAmount
        )

        return (
            this.getAmountCalculator().getProtocolShareOfIntegratorFee(
                taker,
                takingAmount
            ) ?? 0n
        )
    }

    /**
     * Fee in `takerAsset` which protocol gets
     * It equals to `share from integrator fee plus resolver fee`
     *
     * @param taker who will fill order
     * @param makingAmount maker swap amount
     */
    public getProtocolFee(
        taker: Address,
        makingAmount = this.makingAmount
    ): bigint {
        const takingAmount = calcTakingAmount(
            makingAmount,
            this.makingAmount,
            this.takingAmount
        )

        return (
            this.getAmountCalculator().getProtocolFee(taker, takingAmount) ?? 0n
        )
    }

    /**
     * Check whether address allowed to execute order at the given time
     *
     * @param executor address of executor
     * @param executionTime timestamp in sec at which order planning to execute
     */
    public canExecuteAt(executor: Address, executionTime: bigint): boolean {
        return this.fusionExtension.whitelist.canExecuteAt(
            executor,
            executionTime
        )
    }

    /**
     * Check is order expired at a given time
     *
     * @param time timestamp in seconds
     */
    public isExpiredAt(time: bigint): boolean {
        return time > this.deadline
    }

    /**
     * Check if `wallet` can fill order before other
     */
    public isExclusiveResolver(wallet: Address): boolean {
        return this.fusionExtension.whitelist.isExclusiveResolver(wallet)
    }

    /**
     * Check if the auction has exclusive resolver, and it is in the exclusivity period
     */
    public isExclusivityPeriod(time = now()): boolean {
        return this.fusionExtension.whitelist.isExclusivityPeriod(time)
    }

    public getAmountCalculator(): AmountCalculator {
        return AmountCalculator.fromExtension(this.fusionExtension)
    }
}
