import {toSec} from '../utils'
import {AuctionPoint, AuctionWhitelistItem, SettlementSuffixData} from './types'
import {ZERO_ADDRESS, ZERO_NUMBER} from '../constants'
import {
    encodeAuctionParams,
    encodeFlags,
    encodePublicResolvingDeadline,
    encodeTakingFeeData,
    encodeWhitelist
} from './encoder'
import {NoPublicResolvingDeadline} from './constants'
import {parseInteractionsSuffix} from './parser'

export class AuctionSuffix {
    public readonly points: AuctionPoint[]

    public readonly whitelist: AuctionWhitelistItem[]

    public readonly publicResolvingDeadline: number

    public readonly takerFeeReceiver: string

    public readonly takerFeeRatio: string

    constructor(suffix: SettlementSuffixData) {
        this.points = suffix.points

        this.whitelist = suffix.whitelist
        this.publicResolvingDeadline =
            suffix.publicResolvingDeadline || toSec(NoPublicResolvingDeadline)

        this.takerFeeReceiver = suffix?.fee?.takingFeeReceiver || ZERO_ADDRESS
        this.takerFeeRatio = suffix?.fee?.takingFeeRatio || ZERO_NUMBER
    }

    static decode(interactions: string): AuctionSuffix {
        const suffix = parseInteractionsSuffix(interactions)

        return new AuctionSuffix({
            publicResolvingDeadline: suffix.publicResolvingDeadline,
            points: suffix.points,
            fee: {
                takingFeeReceiver: suffix.takerFeeReceiver,
                takingFeeRatio: suffix.takerFeeRatio
            },
            whitelist: suffix.whitelist
        })
    }

    build(): string {
        const auctionParams = encodeAuctionParams(this.points)

        const whitelist = encodeWhitelist(this.whitelist)

        const publicResolving = encodePublicResolvingDeadline(
            this.publicResolvingDeadline
        )

        const takingFeeData = encodeTakingFeeData(
            this.takerFeeReceiver,
            this.takerFeeRatio
        )

        const flags = encodeFlags(this.whitelist, this.points, takingFeeData)

        return (
            auctionParams + whitelist + publicResolving + takingFeeData + flags
        )
    }
}
