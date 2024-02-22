import {Cost, PresetEnum, QuoterResponse} from '../types'
import {Preset} from '../preset'
import {PostInteractionData} from '../../../post-interaction-data'
import {FusionOrder} from '../../../fusion-order'
import {
    NetworkEnum,
    UNWRAPPER_CONTRACT_ADDRESS_MAP,
    WRAPPER_ADDRESS_MAP
} from '../../../constants'
import {QuoterRequest} from '../quoter.request'
import {FusionOrderParams} from './order-params'
import {FusionOrderParamsData} from './types'
import {bpsToRatioFormat} from '../../../sdk/utils'
import {Address} from '../../../address'

export class Quote {
    public readonly fromTokenAmount: bigint

    public readonly feeToken: string

    public readonly presets: {
        [PresetEnum.fast]: Preset
        [PresetEnum.slow]: Preset
        [PresetEnum.medium]: Preset
        [PresetEnum.custom]?: Preset
    }

    public readonly recommendedPreset: PresetEnum

    public readonly toTokenAmount: string

    public readonly prices: Cost

    public readonly volume: Cost

    public readonly whitelist: string[]

    public readonly settlementAddress: string

    public readonly quoteId: string | null

    public readonly bankFee: bigint

    constructor(
        private readonly network: NetworkEnum,
        private readonly params: QuoterRequest,
        response: QuoterResponse
    ) {
        this.fromTokenAmount = BigInt(response.fromTokenAmount)
        this.feeToken = response.feeToken
        this.presets = {
            [PresetEnum.fast]: new Preset(response.presets.fast),
            [PresetEnum.medium]: new Preset(response.presets.medium),
            [PresetEnum.slow]: new Preset(response.presets.slow),
            [PresetEnum.custom]: response.presets.custom
                ? new Preset(response.presets.custom)
                : undefined
        }
        this.toTokenAmount = response.toTokenAmount
        this.prices = response.prices
        this.volume = response.volume
        this.quoteId = response.quoteId
        this.whitelist = response.whitelist
        this.settlementAddress = response.settlementAddress
        this.recommendedPreset = response.recommended_preset
        this.bankFee = BigInt(response.bankFee || 0)
    }

    createFusionOrder(paramsData?: FusionOrderParamsData): FusionOrder {
        const params = FusionOrderParams.new({
            preset: paramsData?.preset || this.recommendedPreset,
            receiver: paramsData?.receiver,
            permit: paramsData?.permit,
            nonce: paramsData?.nonce
        })

        const preset = this.getPreset(params.preset)

        const auctionDetails = preset.createAuctionDetails()

        const suffix = PostInteractionData.new({
            whitelist: this.whitelist.map((resolver) => ({
                address: new Address(resolver),
                allowance: 0
            })),
            integratorFee: {
                ratio: bpsToRatioFormat(this.params.fee) || 0n,
                receiver: paramsData?.takingFeeReceiver
                    ? new Address(paramsData?.takingFeeReceiver)
                    : Address.ZERO_ADDRESS
            },
            bankFee: this.bankFee,
            auctionStartTime: auctionDetails.auctionStartTime
        })

        const takerAsset = this.params.toTokenAddress.isNative()
            ? WRAPPER_ADDRESS_MAP[this.network]
            : this.params.toTokenAddress

        const takerAssetReceiver = this.params.toTokenAddress.isNative()
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
                network: this.network
            },
            auctionDetails,
            suffix,
            {
                deadline:
                    auctionDetails.auctionStartTime +
                    auctionDetails.duration +
                    32n,
                nonce:
                    params.nonce === undefined
                        ? undefined
                        : BigInt(params.nonce),
                unwrapWETH: this.params.toTokenAddress.isNative(),
                permit: params.permit
                    ? this.params.fromTokenAddress + params.permit.substring(2)
                    : undefined,
                allowPartialFills: paramsData?.allowPartialFills
            }
        )
    }

    getPreset(type = PresetEnum.fast): Preset {
        return this.presets[type] as Preset
    }
}
