import {Cost, PresetEnum, QuoterResponse} from '../types'
import {Preset} from '../preset'
import {AuctionSuffix} from '../../../auction-suffix'
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
import {FusionOrderParamsData} from './types'
import {PredicateFactory} from '../../../limit-order/predicate-factory'

export class Quote {
    public readonly fromTokenAmount: string

    public readonly feeToken: string

    public readonly presets: Record<PresetEnum, Preset>

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
    }

    createFusionOrder(paramsData?: FusionOrderParamsData): FusionOrder {
        const params = FusionOrderParams.new(paramsData)

        const preset = this.getPreset(params.preset)

        const salt = preset.createAuctionSalt()

        const fillDurationRange = Math.round(
            preset.auctionDuration / this.whitelist.length
        )

        const suffix = new AuctionSuffix({
            points: preset.points,
            whitelist: this.whitelist.map((resolver, i) => ({
                address: resolver,
                allowance:
                    i === 0
                        ? 0
                        : salt.auctionStartTime -
                          preset.startAuctionIn +
                          fillDurationRange * i
            }))
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
                // todo: add nonce validation and change hardcoded extended deadline
                predicate: PredicateFactory.timestampBelow(
                    salt.auctionStartTime + salt.duration + 32
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
