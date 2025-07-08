import {IntegratorFeeParams} from './quote/index.js'
import {NetworkEnum} from '../../constants.js'

export type QuoterRequestParams = {
    fromTokenAddress: string
    toTokenAddress: string
    amount: string
    walletAddress: string
    enableEstimate?: boolean
    permit?: string
    integratorFee?: IntegratorFeeParams
    source?: string
    isPermit2?: boolean
}

export type QuoterRequestParamsRaw = Omit<
    QuoterRequestParams,
    'integratorFee'
> & {
    fee?: number
    /**
     * tells quoter to use new settlement with surplus
     */
    surplus: true
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
    presets: QuoterPresets
    recommended_preset: PresetEnum
    toTokenAmount: string
    prices: Cost
    volume: Cost
    settlementAddress: string
    whitelist: string[]
    quoteId: string | null
    autoK: number
    fee: ResolverFeePresetRaw
    surplusFee?: number
    marketAmount: string
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
    allowPartialFills: boolean
    allowMultipleFills: boolean
    gasCost: {
        gasBumpEstimate: number
        gasPriceEstimate: string
    }
    exclusiveResolver: string | null
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

export type ResolverFeePresetRaw = {
    /**
     * protocol address
     */
    receiver: string
    bps: number
    whitelistDiscountPercent: number
}
