import {TakingFeeInfo} from '../sdk'

export type AuctionPoint = {
    delay: number
    coefficient: number
}

export type AuctionWhitelistItem = {
    address: string
    allowance: number // seconds
}

export type SettlementSuffixData = {
    points: AuctionPoint[]
    whitelist: AuctionWhitelistItem[]
    publicResolvingDeadline?: number // represents deadline in seconds
    fee?: TakingFeeInfo
}
