import {
    Address,
    Bps,
    OrderInfoData,
    randBigInt,
    ProxyFactory
} from '@1inch/limit-order-sdk'
import {UINT_40_MAX} from '@1inch/byte-utils'
import assert from 'assert'
import {NetworkEnum} from 'constants.js'
import {FusionOrderParams} from './order-params.js'
import {
    FusionOrderParamsData,
    IntegratorFeeResponse,
    ResolverFeePreset
} from './types.js'
import {Cost, PresetEnum, QuoterResponse} from '../types.js'
import {Preset} from '../preset.js'
import {
    FusionOrder,
    SurplusParams,
    Whitelist
} from '../../../fusion-order/index.js'
import {QuoterRequest} from '../quoter.request.js'
import {CHAIN_TO_WRAPPER} from '../../../fusion-order/constants.js'
import {
    Fees,
    ResolverFee,
    IntegratorFee
} from '../../../fusion-order/fees/index.js'
import {Details, Extra} from '../../../fusion-order/types.js'

export class Quote {
    /**
     * Fusion extension address
     * @see https://github.com/1inch/limit-order-settlement
     */
    public readonly settlementAddress: Address

    /**
     * Native asset extension address
     * @see https://github.com/1inch/limit-order-settlement todo: update link
     */
    public readonly nativeOrderFactory?: ProxyFactory

    public readonly fromTokenAmount: bigint

    public readonly presets: {
        [PresetEnum.fast]: Preset
        [PresetEnum.slow]: Preset
        [PresetEnum.medium]: Preset
        [PresetEnum.custom]?: Preset
    }

    public readonly recommendedPreset: PresetEnum

    public readonly toTokenAmount: string

    public readonly marketReturn: bigint

    public readonly prices: Cost

    public readonly volume: Cost

    public readonly whitelist: Address[]

    public readonly quoteId: string | null

    public readonly slippage: number

    public readonly resolverFeePreset: ResolverFeePreset

    public readonly surplusFee?: number

    public readonly integratorFeeParams?: IntegratorFeeResponse

    constructor(
        private readonly params: QuoterRequest,
        response: QuoterResponse
    ) {
        this.fromTokenAmount = BigInt(response.fromTokenAmount)
        this.presets = {
            [PresetEnum.fast]: new Preset(response.presets.fast),
            [PresetEnum.medium]: new Preset(response.presets.medium),
            [PresetEnum.slow]: new Preset(response.presets.slow),
            [PresetEnum.custom]: response.presets.custom
                ? new Preset(response.presets.custom)
                : undefined
        }
        this.toTokenAmount = response.toTokenAmount
        this.marketReturn = BigInt(response.marketAmount)
        this.prices = response.prices
        this.volume = response.volume
        this.quoteId = response.quoteId
        this.whitelist = response.whitelist.map((a) => new Address(a))
        this.recommendedPreset = response.recommended_preset
        this.slippage = response.autoK
        this.settlementAddress = new Address(response.settlementAddress)
        this.nativeOrderFactory =
            response.nativeOrderFactoryAddress &&
            response.nativeOrderImplAddress
                ? new ProxyFactory(
                      new Address(response.nativeOrderFactoryAddress),
                      new Address(response.nativeOrderImplAddress)
                  )
                : undefined
        this.resolverFeePreset = {
            receiver: new Address(response.fee.receiver),
            whitelistDiscountPercent: Bps.fromPercent(
                response.fee.whitelistDiscountPercent
            ),
            bps: new Bps(BigInt(response.fee.bps))
        }
        this.surplusFee = response.surplusFee

        this.integratorFeeParams =
            response.integratorFee && response.integratorFeeReceiver
                ? {
                      receiver: new Address(response.integratorFeeReceiver),
                      value: new Bps(BigInt(response.integratorFee)),
                      share: Bps.fromPercent(response.integratorFeeShare || 0)
                  }
                : undefined
    }

    createFusionOrder(
        paramsData: Omit<FusionOrderParamsData, 'permit' | 'isPermit2'>
    ): FusionOrder {
        const params = FusionOrderParams.new({
            preset: paramsData?.preset || this.recommendedPreset,
            receiver: paramsData?.receiver,
            permit: this.params.permit,
            isPermit2: this.params.isPermit2,
            nonce: paramsData?.nonce,
            delayAuctionStartTimeBy: paramsData?.delayAuctionStartTimeBy,
            network: paramsData.network
        })

        const preset = this.getPreset(params.preset)

        const auctionDetails = preset.createAuctionDetails(
            params.delayAuctionStartTimeBy
        )

        const allowPartialFills =
            paramsData?.allowPartialFills ?? preset.allowPartialFills
        const allowMultipleFills =
            paramsData?.allowMultipleFills ?? preset.allowMultipleFills
        const isNonceRequired = !allowPartialFills || !allowMultipleFills

        const nonce = isNonceRequired
            ? (params.nonce ?? randBigInt(UINT_40_MAX))
            : params.nonce

        const takerAsset = this.params.toTokenAddress.isNative()
            ? CHAIN_TO_WRAPPER[paramsData.network]
            : this.params.toTokenAddress

        const orderInfo = {
            makerAsset: this.params.fromTokenAddress,
            takerAsset: takerAsset,
            makingAmount: this.fromTokenAmount,
            takingAmount: preset.auctionEndAmount,
            maker: this.params.walletAddress,
            receiver: params.receiver
        }

        const details = {
            auction: auctionDetails,
            whitelist: this.getWhitelist(
                auctionDetails.startTime,
                preset.exclusiveResolver
            ),
            surplus: new SurplusParams(
                this.marketReturn,
                Bps.fromPercent(this.surplusFee || 0)
            )
        }
        const extra = {
            nonce,
            unwrapWETH: this.params.toTokenAddress.isNative(),
            permit: params.permit,
            allowPartialFills,
            allowMultipleFills,
            orderExpirationDelay: paramsData?.orderExpirationDelay,
            source: this.params.source,
            enablePermit2: params.isPermit2,
            fees: buildFees(
                this.resolverFeePreset,
                this.integratorFeeParams,
                this.surplusFee
            )
        }

        return this._createOrder(
            paramsData.network,
            this.settlementAddress,
            orderInfo,
            details,
            extra
        )
    }

    getPreset(type = PresetEnum.fast): Preset {
        return this.presets[type] as Preset
    }

    private getWhitelist(
        auctionStartTime: bigint,
        exclusiveResolver?: Address
    ): Whitelist {
        if (exclusiveResolver) {
            return Whitelist.fromNow(
                this.whitelist.map((resolver) => {
                    const isExclusive = resolver.equal(exclusiveResolver)

                    return {
                        address: resolver,
                        allowFrom: isExclusive ? 0n : auctionStartTime
                    }
                })
            )
        }

        return Whitelist.fromNow(
            this.whitelist.map((resolver) => ({
                address: resolver,
                allowFrom: 0n
            }))
        )
    }

    private _createOrder(
        chainId: NetworkEnum,
        settlementExtension: Address,
        orderInfo: OrderInfoData,
        details: Details,
        extra?: Extra
    ): FusionOrder {
        if (this.params.fromTokenAddress.isNative()) {
            assert(
                this.nativeOrderFactory,
                'expected nativeOrderFactory to be set for order from native asset'
            )

            return FusionOrder.fromNative(
                chainId,
                this.nativeOrderFactory,
                settlementExtension,
                orderInfo,
                details,
                extra
            )
        }

        return FusionOrder.new(settlementExtension, orderInfo, details, extra)
    }
}

function buildFees(
    resolverFeePreset: ResolverFeePreset,
    integratorFee?: IntegratorFeeResponse,
    surplusFee?: number
): Fees | undefined {
    const protocolReceiver = resolverFeePreset.receiver
    const hasIntegratorFee = integratorFee && !integratorFee.value.isZero()
    const hasProtocolFee =
        !resolverFeePreset.bps.isZero() || (surplusFee || 0) > 0

    if (!hasProtocolFee && !hasIntegratorFee) {
        return undefined
    }

    return new Fees(
        new ResolverFee(
            protocolReceiver,
            resolverFeePreset.bps,
            resolverFeePreset.whitelistDiscountPercent
        ),
        integratorFee
            ? new IntegratorFee(
                  integratorFee.receiver,
                  protocolReceiver,
                  integratorFee.value,
                  integratorFee.share
              )
            : IntegratorFee.ZERO
    )
}
