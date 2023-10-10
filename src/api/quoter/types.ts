import {NetworkEnum} from '../../constants'

export type QuoterRequestParams = {
    fromTokenAddress: string
    toTokenAddress: string
    amount: string
    walletAddress: string
    enableEstimate?: boolean
    permit?: string
    fee?: number
    source?: string
}

export type QuoterCustomPresetRequestParams = {
    customPreset: CustomPreset
}

export type QuoterApiConfig = {
    network: NetworkEnum
    url: string
    authKey?: string
}

export type QuoterResponse = {
    fromTokenAmount: string
    feeToken: string
    presets: QuoterPresets
    recommended_preset: PresetEnum
    toTokenAmount: string
    prices: Cost
    volume: Cost
    settlementAddress: string
    whitelist: string[]
    quoteId: string | null
}

export type QuoterPresets = {
    fast: PresetData
    medium: PresetData
    slow: PresetData
    custom?: PresetData
}

export type PresetData = {
    auctionDuration: number
    startAuctionIn: number
    bankFee: string
    initialRateBump: number
    auctionStartAmount: string
    auctionEndAmount: string
    tokenFee: string
    points: AuctionPoint[]
}

export type AuctionPoint = {
    delay: number
    coefficient: number
}

export type Cost = {
    usd: {
        fromToken: string
        toToken: string
    }
}

export enum PresetEnum {
    fast = 'fast',
    medium = 'medium',
    slow = 'slow',
    custom = 'custom'
}

export type CustomPreset = {
    auctionDuration: number
    auctionStartAmount: string
    auctionEndAmount: string
    points?: CustomPresetPoint[]
}

export type CustomPresetPoint = {toTokenAmount: string; delay: number}
