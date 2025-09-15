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
import {FusionExtension} from './fusion-extension'
import {AuctionDetails} from './auction-details'
import {SettlementPostInteractionData} from './settlement-post-interaction-data'
import {injectTrackCode} from './source-track'
import {Details, Extra} from './types'
import {AuctionCalculator} from '../auction-calculator'
import {NetworkEnum, ZX} from '../constants'
import {calcTakingAmount} from '../utils/amounts'
import {now} from '../utils/time'

export class FusionOrder {
    private static _ORDER_FEE_BASE_POINTS = 10n ** 15n

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
        postInteractionData: SettlementPostInteractionData,
        extra: Extra = FusionOrder.defaultExtra,
        extension = new FusionExtension(
            settlementExtensionContract,
            auctionDetails,
            postInteractionData,
            extra.permit
                ? new Interaction(orderInfo.makerAsset, extra.permit)
                : undefined
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
        const receiver = postInteractionData.integratorFee?.ratio
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
            SettlementPostInteractionData.new({
                bankFee: details.fees?.bankFee || 0n,
                integratorFee: details.fees?.integratorFee,
                whitelist: details.whitelist,
                resolvingStartTime: details.resolvingStartTime ?? now(),
                customReceiver: orderInfo.receiver
            }),
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
            {..._orderInfo, salt: _order.salt},
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

        const auctionDetails = AuctionDetails.fromExtension(extension)

        const postInteractionData =
            SettlementPostInteractionData.fromExtension(extension)

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
                        : Interaction.decode(extension.makerPermit).data,
                unwrapWETH: makerTraits.isNativeUnwrapEnabled(),
                orderExpirationDelay,
                optimizeReceiverAddress: true
            }
        )
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
            this.fusionExtension.postInteractionData,
            this.fusionExtension.auctionDetails
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

    /**
     * Check is order expired at a given time
     *
     * @param time timestamp in seconds
     */
    public isExpiredAt(time: bigint): boolean {
        return time > this.deadline
    }

    /**
     * Returns how much fee will be credited from a resolver deposit account
     * Token of fee set in Settlement extension constructor
     * Actual deployments can be found at https://github.com/1inch/limit-order-settlement/tree/master/deployments
     *
     * @param filledMakingAmount which resolver fills
     * @see https://github.com/1inch/limit-order-settlement/blob/0e3cae3653092ebb4ea5d2a338c87a54351ad883/contracts/extensions/ResolverFeeExtension.sol#L29
     */
    public getResolverFee(filledMakingAmount: bigint): bigint {
        return (
            (this.fusionExtension.postInteractionData.bankFee *
                FusionOrder._ORDER_FEE_BASE_POINTS *
                filledMakingAmount) /
            this.makingAmount
        )
    }

    /**
     * Check if `wallet` can fill order before other
     */
    public isExclusiveResolver(wallet: Address): boolean {
        return this.fusionExtension.postInteractionData.isExclusiveResolver(
            wallet
        )
    }

    /**
     * Check if the auction has exclusive resolver, and it is in the exclusivity period
     */
    public isExclusivityPeriod(time = now()): boolean {
        return this.fusionExtension.postInteractionData.isExclusivityPeriod(
            time
        )
    }
}
