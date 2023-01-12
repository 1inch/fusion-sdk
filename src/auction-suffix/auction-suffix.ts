import { toSec } from '../utils'
import {AuctionPoint, AuctionWhitelistItem, SettlementSuffixData} from './types';
import {ZERO_ADDRESS} from '../constants';
import {
    encodeAuctionParams,
    encodeFlags,
    encodePublicResolvingDeadline,
    encodeTakingFeeData,
    encodeWhitelist
} from './encoder';
import {NoPublicResolvingDeadline} from './constants';

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

        this.takerFeeReceiver = suffix.takerFeeReceiver || ZERO_ADDRESS
        this.takerFeeRatio = suffix.takerFeeRatio || '0'
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
