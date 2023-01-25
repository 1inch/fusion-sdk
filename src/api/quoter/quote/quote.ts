import {Cost, PresetEnum, QuoterResponse} from '../types'
import {Preset} from '../preset'
import {AuctionSuffix} from '../../../auction-suffix'
import {FusionOrder} from '../../../fusion-order'
import {isNativeCurrency} from '../../../utils'
import {
    NetworkEnum,
    UNWRAPPER_CONTRACT_ADDRESS_MAP,
    WRAPPER_ADDRESS_MAP,
    ZERO_ADDRESS
} from '../../../constants'
import {InteractionsFactory} from '../../../limit-order/interactions-factory'
import {QuoterRequest} from '../quoter.request'
import {FusionOrderParams} from './order-params'
import {FusionOrderParamsData} from './types'

export class Quote {
    public readonly fromTokenAmount: string

    public readonly feeToken: string

    public readonly presets: Record<PresetEnum, Preset>

    public readonly toTokenAmount: string

    public readonly prices: Cost

    public readonly volume: Cost

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
    }

    createFusionOrder(paramsData?: FusionOrderParamsData): FusionOrder {
        const params = FusionOrderParams.new(paramsData)

        const preset = this.getPreset(params.preset)

        const salt = preset.createAuctionSalt()

        const suffix = new AuctionSuffix({
            points: preset.points,
            whitelist: [] // todo: fetch whitelist from quoter
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
                allowedSender: ZERO_ADDRESS // todo: add settlement contract
            },
            salt,
            suffix,
            {
                postInteraction: this.buildUnwrapPostInteractionIfNeeded(
                    params.receiver
                )
            }
        )
    }

    getPreset(type = PresetEnum.fast): Preset {
        return this.presets[type]
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
