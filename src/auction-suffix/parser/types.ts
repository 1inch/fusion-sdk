import {AuctionPoint, AuctionWhitelistItem} from '../types'

export type InteractionAdditionalInfo = {
    points: AuctionPoint[]
    whitelist: AuctionWhitelistItem[]
    publicResolvingDeadline: number
    takerFeeReceiver: string
    takerFeeRatio: string
}

export type InteractionFlags = {
    takingFeeEnabled: boolean
    resolversCount: number
    pointsCount: number
}

export type TakerFeeData = {
    takerFeeRatio: string
    takerFeeReceiver: string
} & RemainingInteractions

export type PrivateAuctionDeadline = {
    deadline: number
} & RemainingInteractions

export type ResolversWhitelist = {
    whitelist: AuctionWhitelistItem[]
} & RemainingInteractions

export type ParsedAuctionParams = {
    points: AuctionPoint[]
} & RemainingInteractions

export type RemainingInteractions = {interactions: string}
