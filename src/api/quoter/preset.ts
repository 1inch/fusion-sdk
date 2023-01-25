import {AuctionPoint, PresetData} from './types'
import {AuctionSalt} from '../../auction-salt'

export class Preset {
    public readonly auctionDuration: number

    public readonly startAuctionIn: number

    public readonly bankFee: string

    public readonly initialRateBump: number

    public readonly auctionStartAmount: string

    public readonly auctionEndAmount: string

    public readonly tokenFee: string

    public readonly points: AuctionPoint[]

    constructor(preset: PresetData) {
        this.auctionDuration = preset.auctionDuration
        this.startAuctionIn = preset.startAuctionIn
        this.bankFee = preset.bankFee
        this.initialRateBump = preset.initialRateBump
        this.auctionStartAmount = preset.auctionStartAmount
        this.auctionEndAmount = preset.auctionEndAmount
        this.tokenFee = preset.tokenFee
        this.points = preset.points
    }

    createAuctionSalt(additionalWaitPeriod = 0): AuctionSalt {
        return new AuctionSalt({
            duration: this.auctionDuration,
            auctionStartTime: this.calcAuctionStartTime(additionalWaitPeriod),
            initialRateBump: this.initialRateBump,
            bankFee: this.bankFee
        })
    }

    calcAuctionStartTime(additionalWaitPeriod = 0): number {
        return (
            Math.floor(Date.now() / 1000) +
            additionalWaitPeriod +
            this.startAuctionIn
        )
    }
}
