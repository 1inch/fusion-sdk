import {Address} from '../address'
import {Extension} from './extension'

export type OrderInfoData = {
    makerAsset: Address
    takerAsset: Address
    makingAmount: bigint
    takingAmount: bigint
    maker: Address
    salt?: bigint
    receiver?: Address
}

export type LimitOrderV4Struct = {
    salt: string
    maker: string
    receiver: string
    makerAsset: string
    takerAsset: string
    makingAmount: string
    takingAmount: string
    makerTraits: string
}

export interface IExtensionBuilder {
    build(): Extension
}
