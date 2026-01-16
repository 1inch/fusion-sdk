import {
    Address,
    EIP712TypedData,
    Extension,
    Interaction,
    LimitOrder,
    LimitOrderV4Struct,
    MakerTraits,
    OrderInfoData,
    ProxyFactory
} from '@1inch/limit-order-sdk'
import assert from 'assert'
import {FusionExtension} from './fusion-extension.js'
import {AuctionDetails} from './auction-details/index.js'

import {injectTrackCode} from './source-track.js'
import {Whitelist} from './whitelist/whitelist.js'
import {SurplusParams} from './surplus-params.js'
import type {Details, Extra} from './types.js'
import {AuctionCalculator} from '../amount-calculator/auction-calculator/index.js'
import {NetworkEnum, ZX} from '../constants.js'
import {calcTakingAmount} from '../utils/amounts.js'
import {now} from '../utils/time.js'
import {AmountCalculator} from '../amount-calculator/amount-calculator.js'

export class FusionOrder {
    private static defaultExtra = {
        allowPartialFills: true,
        allowMultipleFills: true,
        unwrapWETH: false,
        enablePermit2: false,
        orderExpirationDelay: 12n,
        optimizeReceiverAddress: true
    }

    public readonly fusionExtension: FusionExtension

    protected inner: LimitOrder

    protected constructor(
        /**
         * Fusion extension address
         * @see https://github.com/1inch/limit-order-settlement
         */
        public readonly settlementExtensionContract: Address,
        orderInfo: OrderInfoData,
        auctionDetails: AuctionDetails,
        whitelist: Whitelist,
        surplusParams = SurplusParams.NO_FEE,
        extra: Extra = FusionOrder.defaultExtra,
        extension = new FusionExtension(
            settlementExtensionContract,
            auctionDetails,
            whitelist,
            surplusParams,
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
        const receiver =
            extra.fees || !surplusParams.isZero()
                ? settlementExtensionContract
                : orderInfo.receiver

        const builtExtension = extension.build()
        const salt = LimitOrder.buildSalt(builtExtension, orderInfo.salt)
        const saltWithInjectedTrackCode = orderInfo.salt
            ? salt
            : injectTrackCode(salt, extra.source)

        if (orderInfo.makerAsset.isNative()) {
            throw new Error(
                'use FusionOrder.fromNative to create order from native asset'
            )
        }

        if (!surplusParams.isZero()) {
            assert(
                orderInfo.takingAmount <= surplusParams.estimatedTakerAmount,
                'order.takingAmount must be less then surplusParams.estimatedTakerAmount'
            )
        }

        const optimizeReceiverAddress =
            extra.optimizeReceiverAddress !== undefined
                ? extra.optimizeReceiverAddress
                : FusionOrder.defaultExtra.optimizeReceiverAddress

        this.inner = new LimitOrder(
            {
                ...orderInfo,
                receiver,
                salt: saltWithInjectedTrackCode
            },
            makerTraits,
            builtExtension,
            {optimizeReceiverAddress}
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

    /**
     * Returns actual receiver of funds
     *
     * Do not use this field to pass to order struct as it can lead to lost of funds
     * For such cases use `order.receiver`
     *
     * @see receiver
     */
    get realReceiver(): Address {
        const hasFee = Boolean(this.fusionExtension.extra?.fees)

        const receiver = hasFee
            ? this.fusionExtension.extra?.customReceiver
            : this.inner.receiver

        return receiver && !receiver.isZero() ? receiver : this.maker
    }

    /**
     * Receiver from order struct
     *
     * @see realReceiver
     */
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
        details: Details,
        extra?: Extra
    ): FusionOrder {
        return new FusionOrder(
            settlementExtension,
            orderInfo,
            details.auction,
            details.whitelist,
            details.surplus,
            extra
        )
    }

    static isNativeOrder(
        chainId: number,
        ethOrderFactory: ProxyFactory,
        order: LimitOrderV4Struct,
        signature: string
    ): boolean {
        return LimitOrder.isNativeOrder(
            chainId,
            ethOrderFactory,
            order,
            signature
        )
    }

    /**
     * Create new order from native asset
     *
     *
     * Note, that such order should be submitted on-chain through `ETHOrders.depositForOrder` AND off-chain through submit to relayer
     * // todo: update link
     * @see ETHOrders.depositForOrder https://github.com/1inch/limit-order-protocol/blob/c100474444cd71cf7989cd8a63f375e72656b8b4/contracts/extensions/ETHOrders.sol#L89
     */
    static fromNative(
        chainId: NetworkEnum,
        ethOrdersFactory: ProxyFactory,
        /**
         * Fusion extension address
         * @see https://github.com/1inch/limit-order-settlement
         */
        settlementExtension: Address,
        orderInfo: Omit<OrderInfoData, 'makerAsset'>,
        details: Details,
        extra?: Extra
    ): FusionOrder {
        const _orderInfo = {
            ...orderInfo,
            makerAsset: LimitOrder.CHAIN_TO_WRAPPER[chainId],
            receiver:
                orderInfo.receiver && !orderInfo.receiver.isZero()
                    ? orderInfo.receiver
                    : orderInfo.maker
        }

        const _order = FusionOrder.new(
            settlementExtension,
            _orderInfo,
            details,
            {...extra, optimizeReceiverAddress: false}
        )

        _order.inner = LimitOrder.fromNative(
            chainId,
            ethOrdersFactory,
            {..._orderInfo, receiver: _order.receiver, salt: _order.salt},
            _order.inner.makerTraits,
            _order.inner.extension
        )

        return _order
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

        const {auctionDetails, whitelist, extra, surplus} =
            FusionExtension.fromExtension(extension)

        const deadline = makerTraits.expiration()

        const orderExpirationDelay =
            deadline === null
                ? undefined
                : deadline - auctionDetails.startTime - auctionDetails.duration

        const providedSalt = BigInt(order.salt)

        const fusionOrder = new FusionOrder(
            settlementContract,
            {
                // shift because of how LimitOrder.buildSalt works
                salt: providedSalt >> 160n,
                maker: new Address(order.maker),
                receiver: extra?.customReceiver,
                makerAsset: new Address(order.makerAsset),
                takerAsset: new Address(order.takerAsset),
                makingAmount: BigInt(order.makingAmount),
                takingAmount: BigInt(order.takingAmount)
            },
            auctionDetails,
            whitelist,
            surplus,
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
                fees: extra?.fees,
                optimizeReceiverAddress: true
            }
        )

        assert(
            providedSalt === fusionOrder.salt,
            'invalid salt for passed extension'
        )

        return fusionOrder
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

        return this.getAmountCalculator().getRequiredTakingAmount(
            taker,
            takingAmount,
            time,
            blockBaseFee
        )
    }

    /**
     * How much user will receive in taker asset
     *
     * @param taker who will fill order
     * @param makingAmount maker swap amount
     * @param time block time at which order will be filled
     * @param blockBaseFee base fee of block at which order will be filled
     */
    public getUserReceiveAmount(
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

        return this.getAmountCalculator().getUserTakingAmount(
            taker,
            makingAmount,
            takingAmount,
            this.makingAmount,
            time,
            blockBaseFee
        )
    }

    /**
     * How much surplus will be shared with protocol
     *
     * @param taker who will fill order
     * @param makingAmount maker swap amount
     * @param time block time at which order will be filled
     * @param blockBaseFee base fee of block at which order will be filled
     */
    public getSurplusFee(
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

        return this.getAmountCalculator().getSurplusFee(
            taker,
            makingAmount,
            takingAmount,
            this.makingAmount,
            time,
            blockBaseFee
        )
    }

    /**
     * Fee in `takerAsset` which resolver pays to resolver fee receiver
     *
     * @param taker who will fill order
     * @param makingAmount maker swap amount
     * @param time block time at which order will be filled
     * @param blockBaseFee base fee of block at which order will be filled
     */
    public getResolverFee(
        taker: Address,
        time: bigint,
        blockBaseFee = 0n,
        makingAmount = this.makingAmount
    ): bigint {
        const takingAmount = calcTakingAmount(
            makingAmount,
            this.makingAmount,
            this.takingAmount
        )

        return (
            this.getAmountCalculator().getResolverFee(
                taker,
                takingAmount,
                time,
                blockBaseFee
            ) ?? 0n
        )
    }

    /**
     * Fee in `takerAsset` which integrator gets to integrator wallet
     *
     * @param taker who will fill order
     * @param makingAmount maker swap amount
     * @param time block time at which order will be filled
     * @param blockBaseFee base fee of block at which order will be filled
     */
    public getIntegratorFee(
        taker: Address,
        time: bigint,
        blockBaseFee = 0n,
        makingAmount = this.makingAmount
    ): bigint {
        const takingAmount = calcTakingAmount(
            makingAmount,
            this.makingAmount,
            this.takingAmount
        )

        return (
            this.getAmountCalculator().getIntegratorFee(
                taker,
                takingAmount,
                time,
                blockBaseFee
            ) ?? 0n
        )
    }

    /**
     * Fee in `takerAsset` which protocol gets as share from integrator fee
     *
     * @param taker who will fill order
     * @param makingAmount maker swap amount
     * @param time block time at which order will be filled
     * @param blockBaseFee base fee of block at which order will be filled
     */
    public getProtocolShareOfIntegratorFee(
        taker: Address,
        time: bigint,
        blockBaseFee = 0n,
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
                takingAmount,
                time,
                blockBaseFee
            ) ?? 0n
        )
    }

    /**
     * Fee in `takerAsset` which protocol gets
     * It equals to `share from integrator fee plus resolver fee`
     *
     * @param taker who will fill order
     * @param makingAmount maker swap amount
     * @param time block time at which order will be filled
     * @param blockBaseFee base fee of block at which order will be filled
     */
    public getProtocolFee(
        taker: Address,
        time: bigint,
        blockBaseFee = 0n,
        makingAmount = this.makingAmount
    ): bigint {
        const takingAmount = calcTakingAmount(
            makingAmount,
            this.makingAmount,
            this.takingAmount
        )

        return (
            this.getAmountCalculator().getProtocolFee(
                taker,
                takingAmount,
                time,
                blockBaseFee
            ) ?? 0n
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

    public isNative(
        chainId: number,
        ethOrderFactory: ProxyFactory,
        signature: string
    ): boolean {
        return this.inner.isNative(chainId, ethOrderFactory, signature)
    }

    /**
     * Returns signature for submitting native order on-chain
     * Only valid if order is native
     *
     * @see FusionOrder.isNative
     * @see FusionOrder.fromNative
     */
    public nativeSignature(maker: Address): string {
        return this.inner.nativeSignature(maker)
    }
}
