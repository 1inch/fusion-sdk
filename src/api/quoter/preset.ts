import {Address} from '@1inch/limit-order-sdk'
import {AuctionPoint, PresetData} from './types'
import {AuctionDetails} from '../../fusion-order'

export class Preset {
    public readonly auctionDuration: bigint

    public readonly startAuctionIn: bigint

    public readonly bankFee: bigint

    public readonly initialRateBump: number

    public readonly auctionStartAmount: bigint

    public readonly auctionEndAmount: bigint

    public readonly tokenFee: bigint

    public readonly points: AuctionPoint[]

    public readonly gasCostInfo: {
        gasBumpEstimate: bigint
        gasPriceEstimate: bigint
    }

    public readonly exclusiveResolver?: Address

    public readonly allowPartialFills: boolean

    public readonly allowMultipleFills: boolean

    constructor(preset: PresetData) {
        this.auctionDuration = BigInt(preset.auctionDuration)
        this.startAuctionIn = BigInt(preset.startAuctionIn)
        this.bankFee = BigInt(preset.bankFee)
        this.initialRateBump = preset.initialRateBump
        this.auctionStartAmount = BigInt(preset.auctionStartAmount)
        this.auctionEndAmount = BigInt(preset.auctionEndAmount)
        this.tokenFee = BigInt(preset.tokenFee)
        this.points = preset.points
        this.gasCostInfo = {
            gasPriceEstimate: BigInt(preset.gasCost?.gasPriceEstimate || 0n),
            gasBumpEstimate: BigInt(preset.gasCost?.gasBumpEstimate || 0n)
        }
        this.exclusiveResolver = preset.exclusiveResolver
            ? new Address(preset.exclusiveResolver)
            : undefined
        this.allowPartialFills = preset.allowPartialFills
        this.allowMultipleFills = preset.allowMultipleFills
    }

    createAuctionDetails(additionalWaitPeriod = 0n): AuctionDetails {
        return new AuctionDetails({
            duration: this.auctionDuration,
            startTime: this.calcAuctionStartTime(additionalWaitPeriod),
            initialRateBump: this.initialRateBump,
            points: this.points,
            gasCost: this.gasCostInfo
        })
    }

    private calcAuctionStartTime(additionalWaitPeriod = 0n): bigint {
        return (
            BigInt(Math.floor(Date.now() / 1000)) +
            additionalWaitPeriod +
            this.startAuctionIn
        )
    }
}
