import {Address, randBigInt} from '@1inch/limit-order-sdk'
import {UINT_40_MAX} from '@1inch/byte-utils'
import {FusionOrderParams} from './order-params'
import {FusionOrderParamsData} from './types'
import {Cost, PresetEnum, QuoterResponse} from '../types'
import {Preset} from '../preset'
import {AuctionWhitelistItem, FusionOrder} from '../../../fusion-order'
import {QuoterRequest} from '../quoter.request'
import {bpsToRatioFormat} from '../../../sdk'
import {CHAIN_TO_WRAPPER} from '../../../fusion-order/constants'

export class Quote {
    /**
     * Fusion extension address
     * @see https://github.com/1inch/limit-order-settlement
     */
    public readonly settlementAddress: Address

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
        this.recommendedPreset = response.recommended_preset
        this.settlementAddress = new Address(response.settlementAddress)
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
            ? params.nonce ?? randBigInt(UINT_40_MAX)
            : params.nonce

        const takerAsset = this.params.toTokenAddress.isNative()
            ? CHAIN_TO_WRAPPER[paramsData.network]
            : this.params.toTokenAddress

        return FusionOrder.new(
            this.settlementAddress,
            {
                makerAsset: this.params.fromTokenAddress,
                takerAsset: takerAsset,
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
                nonce,
                unwrapWETH: this.params.toTokenAddress.isNative(),
                permit: params.permit,
                allowPartialFills,
                allowMultipleFills,
                orderExpirationDelay: paramsData?.orderExpirationDelay,
                source: this.params.source,
                enablePermit2: params.isPermit2
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
            return this.whitelist.map((resolver) => {
                const isExclusive = resolver.equal(exclusiveResolver)

                return {
                    address: resolver,
                    allowFrom: isExclusive ? 0n : auctionStartTime
                }
            })
        }

        return this.whitelist.map((resolver) => ({
            address: resolver,
            allowFrom: 0n
        }))
    }
}
