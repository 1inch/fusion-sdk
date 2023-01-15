export type OrderInfoData = {
    makerAsset: string
    takerAsset: string
    makingAmount: string
    takingAmount: string
    maker: string
    salt?: string
    allowedSender?: string
    receiver?: string
}

export type InteractionsData = {
    makerAssetData?: string
    takerAssetData?: string
    getMakingAmount?: string
    getTakingAmount?: string
    predicate?: string
    permit?: string
    preInteraction?: string
    postInteraction?: string
}

export type LimitOrderV3Struct = {
    salt: string
    makerAsset: string
    takerAsset: string
    maker: string
    receiver: string
    allowedSender: string
    makingAmount: string
    takingAmount: string
    offsets: string
    interactions: string
}
