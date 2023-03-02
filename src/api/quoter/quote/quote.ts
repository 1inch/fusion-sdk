import {Cost, PresetEnum, QuoterResponse} from '../types'
import {Preset} from '../preset'
import {AuctionSuffix, encodeTakingFeeData} from '../../../auction-suffix'
import {FusionOrder} from '../../../fusion-order'
import {isNativeCurrency} from '../../../utils'
import {
    NetworkEnum,
    UNWRAPPER_CONTRACT_ADDRESS_MAP,
    WRAPPER_ADDRESS_MAP
} from '../../../constants'
import {InteractionsFactory} from '../../../limit-order/interactions-factory'
import {QuoterRequest} from '../quoter.request'
import {FusionOrderParams} from './order-params'
import {FusionOrderParamsData, PredicateParams} from './types'
import {PredicateFactory} from '../../../limit-order/predicate-factory'

export class Quote {
    public readonly fromTokenAmount: string

    public readonly feeToken: string

    public readonly presets: Record<PresetEnum, Preset>

    public readonly recommendedPreset: PresetEnum

    public readonly toTokenAmount: string

    public readonly prices: Cost

    public readonly volume: Cost

    public readonly whitelist: string[]

    public readonly settlementAddress: string

    public readonly quoteId: string | null

    constructor(
        private readonly network: NetworkEnum,
        private readonly params: QuoterRequest,
        response: QuoterResponse
    ) {
        this.fromTokenAmount = response.fromTokenAmount
        this.feeToken = response.feeToken
        this.presets = {
            [PresetEnum.fast]: new Preset(response.presets.fast),
            [PresetEnum.medium]: new Preset(response.presets.medium),
            [PresetEnum.slow]: new Preset(response.presets.slow)
        }
        this.toTokenAmount = response.toTokenAmount
        this.prices = response.prices
        this.volume = response.volume
        this.quoteId = response.quoteId
        this.whitelist = response.whitelist
        this.settlementAddress = response.settlementAddress
        this.recommendedPreset = response.recommended_preset
    }

    createFusionOrder(paramsData?: FusionOrderParamsData): FusionOrder {
        const params = FusionOrderParams.new({
            preset: paramsData?.preset || this.recommendedPreset,
            receiver: paramsData?.receiver,
            permit: paramsData?.permit,
            nonce: paramsData?.nonce,
            takingFeeReceiver: paramsData?.takingFeeReceiver,
            takingFeeRatio: paramsData?.takingFeeRatio
        })

        const preset = this.getPreset(params.preset)

        const salt = preset.createAuctionSalt()

        const suffix = new AuctionSuffix({
            points: preset.points,
            whitelist: this.whitelist.map((resolver) => ({
                address: resolver,
                allowance: 0
            })),
            takerFeeReceiver: params.takingFeeReceiver,
            takerFeeRatio: params.takingFeeRatio
        })

        const takerAsset = isNativeCurrency(this.params.toTokenAddress)
            ? WRAPPER_ADDRESS_MAP[this.network]
            : this.params.toTokenAddress

        const takerAssetReceiver = isNativeCurrency(this.params.toTokenAddress)
            ? UNWRAPPER_CONTRACT_ADDRESS_MAP[this.network]
            : params.receiver

        return new FusionOrder(
            {
                makerAsset: this.params.fromTokenAddress,
                takerAsset,
                makingAmount: this.fromTokenAmount,
                takingAmount: preset.auctionEndAmount,
                maker: this.params.walletAddress,
                receiver: takerAssetReceiver,
                allowedSender: this.settlementAddress
            },
            salt,
            suffix,
            {
                postInteraction: this.buildUnwrapPostInteractionIfNeeded(
                    params.receiver
                ),
                // todo: change hardcoded extended deadline
                predicate: this.handlePredicate({
                    deadline: salt.auctionStartTime + salt.duration + 32,
                    address: this.params.walletAddress,
                    nonce: params.nonce
                }),
                permit: params.permit
                    ? this.params.fromTokenAddress + params.permit.substring(2)
                    : undefined,
                takingFeeData: encodeTakingFeeData(
                    params.takingFeeReceiver,
                    params.takingFeeRatio
                )
            }
        )
    }

    getPreset(type = PresetEnum.fast): Preset {
        return this.presets[type]
    }

    private handlePredicate(params: PredicateParams): string {
        if (params?.nonce) {
            return PredicateFactory.timestampBelowAndNonceEquals(
                params.address,
                params.nonce,
                params.deadline
            )
        }

        return PredicateFactory.timestampBelow(params.deadline)
    }

    private buildUnwrapPostInteractionIfNeeded(
        receiver: string | undefined
    ): string | undefined {
        if (!isNativeCurrency(this.params.toTokenAddress)) {
            return undefined
        }

        return InteractionsFactory.unwrap(
            WRAPPER_ADDRESS_MAP[this.network],
            receiver || this.params.walletAddress
        )
    }
}
