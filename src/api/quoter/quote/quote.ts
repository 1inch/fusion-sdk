import {Cost, PresetEnum, QuoterResponse} from '../types'
import {Preset} from '../preset'
import {AuctionWhitelistItem} from '../../../fusion-order/settlement-post-interaction-data'
import {FusionOrder} from '../../../fusion-order'
import {QuoterRequest} from '../quoter.request'
import {FusionOrderParams} from './order-params'
import {FusionOrderParamsData} from './types'
import {bpsToRatioFormat} from '../../../sdk/utils'
import {Address} from '@1inch/limit-order-sdk'

export class Quote {
    /**
     * Fusion extension address
     * @see https://github.com/1inch/limit-order-settlement
     */
    public readonly extension: Address

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

    public readonly whitelist: Address[]

    public readonly settlementAddress: string

    public readonly quoteId: string | null

    constructor(
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
        this.whitelist = response.whitelist.map((a) => new Address(a))
        this.settlementAddress = response.settlementAddress
        this.recommendedPreset = response.recommended_preset
        this.extension = new Address(response.extension)
    }

    createFusionOrder(paramsData: FusionOrderParamsData): FusionOrder {
        const params = FusionOrderParams.new({
            preset: paramsData?.preset || this.recommendedPreset,
            receiver: paramsData?.receiver,
            permit: paramsData?.permit,
            nonce: paramsData?.nonce
        })

        const preset = this.getPreset(params.preset)

        const auctionDetails = preset.createAuctionDetails(
            params.delayAuctionStartTimeBy
        )

        return FusionOrder.new(
            this.extension,
            {
                makerAsset: this.params.fromTokenAddress,
                takerAsset: this.params.toTokenAddress,
                makingAmount: this.fromTokenAmount,
                takingAmount: preset.auctionEndAmount,
                maker: this.params.walletAddress,
                receiver: params.receiver
            },
            {
                auction: auctionDetails,
                fees: {
                    integratorFee: {
                        ratio: bpsToRatioFormat(this.params.fee) || 0n,
                        receiver: paramsData?.takingFeeReceiver
                            ? new Address(paramsData?.takingFeeReceiver)
                            : Address.ZERO_ADDRESS
                    },
                    bankFee: preset.bankFee
                },
                whitelist: this.getWhitelist(
                    auctionDetails.startTime,
                    preset.exclusiveResolver
                )
            },
            {
                nonce: params.nonce,
                unwrapWETH: this.params.toTokenAddress.isNative(),
                permit: params.permit
                    ? this.params.fromTokenAddress + params.permit.substring(2)
                    : undefined,
                allowPartialFills:
                    paramsData?.allowPartialFills ?? preset.allowPartialFills,
                allowMultipleFills:
                    paramsData?.allowMultipleFills ?? preset.allowMultipleFills,
                orderExpirationDelay: paramsData?.orderExpirationDelay
            }
        )
    }

    getPreset(type = PresetEnum.fast): Preset {
        return this.presets[type] as Preset
    }

    private getWhitelist(
        auctionStartTime: bigint,
        exclusiveResolver?: Address
    ): AuctionWhitelistItem[] {
        if (exclusiveResolver) {
            this.whitelist.map((resolver) => {
                const isExclusive = resolver.equal(exclusiveResolver)

                return {
                    address: resolver,
                    allowance: isExclusive ? 0n : auctionStartTime
                }
            })
        }

        return this.whitelist.map((resolver) => ({
            address: resolver,
            delay: 0n
        }))
    }
}
