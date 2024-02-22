import {AuctionPoint, PresetData} from './types'
import {AuctionDetails} from '../../auction-details'

export class Preset {
    public readonly auctionDuration: number

    public readonly startAuctionIn: number

    public readonly bankFee: string

    public readonly initialRateBump: number

    public readonly auctionStartAmount: bigint

    public readonly auctionEndAmount: bigint

    public readonly tokenFee: bigint

    public readonly points: AuctionPoint[]

    constructor(preset: PresetData) {
        this.auctionDuration = preset.auctionDuration
        this.startAuctionIn = preset.startAuctionIn
        this.bankFee = preset.bankFee
        this.initialRateBump = preset.initialRateBump
        this.auctionStartAmount = BigInt(preset.auctionStartAmount)
        this.auctionEndAmount = BigInt(preset.auctionEndAmount)
        this.tokenFee = BigInt(preset.tokenFee)
        this.points = preset.points
    }

    createAuctionDetails(additionalWaitPeriod = 0): AuctionDetails {
        return new AuctionDetails({
            duration: this.auctionDuration,
            auctionStartTime: this.calcAuctionStartTime(additionalWaitPeriod),
            initialRateBump: this.initialRateBump,
            points: this.points
        })
    }

    private calcAuctionStartTime(additionalWaitPeriod = 0): bigint {
        return BigInt(
            Math.floor(Date.now() / 1000) +
                additionalWaitPeriod +
                this.startAuctionIn
        )
    }
}
