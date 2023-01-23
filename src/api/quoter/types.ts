import {NetworkEnum} from '../../constants'

export type QuoterRequestParams = {
    fromTokenAddress: string
    toTokenAddress: string
    amount: string
    walletAddress: string
    enableEstimate?: boolean
    permit?: string
}

export type QuoterConfig = {
    network: NetworkEnum
    url: string
}

export type QuoterResponse = {
    fromTokenAmount: string
    feeToken: string
    presets: QuoterPresets
    toTokenAmount: string
    prices: Cost
    volume: Cost
    quoteId: string | null
}

export type QuoterPresets = {
    fast: Preset
    medium: Preset
    slow: Preset
}

export type Preset = {
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
