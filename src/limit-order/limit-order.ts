import {toBN, trim0x} from '../utils'
import {
    buildOrderData,
    getLimitOrderV3Domain,
    getOrderHash,
    EIP712TypedData
} from './eip712'
import {ZERO_ADDRESS, ZX} from '../constants'
import {buildSalt} from './utils'
import {InteractionsData, LimitOrderV3Struct, OrderInfoData} from './types'
import {parseInteractions} from './parser'

export class LimitOrder {
    public readonly makerAsset: string

    public readonly takerAsset: string

    public readonly makingAmount: string

    public readonly takingAmount: string

    public readonly from: string

    public readonly allowedSender: string

    public readonly receiver: string

    public readonly makerAssetData: string

    public readonly takerAssetData: string

    public readonly getMakingAmount: string

    public readonly getTakingAmount: string

    public readonly predicate: string

    public readonly permit: string

    public readonly preInteraction: string

    public readonly postInteraction: string

    protected salt: string

    constructor(orderInfo: OrderInfoData, interactions?: InteractionsData) {
        this.makerAsset = orderInfo.makerAsset
        this.takerAsset = orderInfo.takerAsset
        this.makingAmount = orderInfo.makingAmount
        this.takingAmount = orderInfo.takingAmount
        this.salt = orderInfo.salt || buildSalt()
        this.from = orderInfo.maker
        this.allowedSender = orderInfo.allowedSender || ZERO_ADDRESS
        this.receiver = orderInfo.receiver || ZERO_ADDRESS
        this.makerAssetData = interactions?.makerAssetData || ZX
        this.takerAssetData = interactions?.takerAssetData || ZX

        this.getMakingAmount = interactions?.getMakingAmount || ZX

        this.getTakingAmount = interactions?.getTakingAmount || ZX

        this.predicate = interactions?.predicate || ZX
        this.permit = interactions?.permit || ZX
        this.preInteraction = interactions?.preInteraction || ZX
        this.postInteraction = interactions?.postInteraction || ZX
    }

    static getOrderHash(
        order: LimitOrderV3Struct,
        domain = getLimitOrderV3Domain(1)
    ): string {
        return getOrderHash(LimitOrder.getTypedData(order, domain))
    }

    static getTypedData(
        order: LimitOrderV3Struct,
        domain = getLimitOrderV3Domain(1)
    ): EIP712TypedData {
        return buildOrderData(
            domain.chainId,
            domain.verifyingContract,
            domain.name,
            domain.version,
            order
        )
    }

    static decode(struct: LimitOrderV3Struct): LimitOrder {
        const interactions = parseInteractions(
            struct.offsets,
            struct.interactions
        )

        return new LimitOrder(
            {
                makerAsset: struct.makerAsset,
                takerAsset: struct.takerAsset,
                maker: struct.maker,
                takingAmount: struct.takingAmount,
                makingAmount: struct.makingAmount,
                allowedSender: struct.allowedSender,
                receiver: struct.receiver,
                salt: struct.salt
            },
            interactions
        )
    }

    build(): LimitOrderV3Struct {
        const allInteractions = [
            this.makerAssetData,
            this.takerAssetData,
            this.getMakingAmount,
            this.getTakingAmount,
            this.predicate,
            this.permit,
            this.preInteraction,
            this.postInteraction
        ]

        // https://stackoverflow.com/a/55261098/440168
        const cumulativeSum = (
            (sum) =>
            (value: number): number => {
                sum += value

                return sum
            }
        )(0)

        const offsets = allInteractions
            .map((a) => a.length / 2 - 1)
            .map(cumulativeSum)
            .reduce(
                (acc, a, i) => acc.add(toBN(a as number).shln(32 * i)),
                toBN(0)
            )

        const interactions = '0x' + allInteractions.map(trim0x).join('')

        return {
            salt: this.salt,
            makerAsset: this.makerAsset,
            takerAsset: this.takerAsset,
            maker: this.from,
            receiver: this.receiver,
            allowedSender: this.allowedSender,
            makingAmount: this.makingAmount,
            takingAmount: this.takingAmount,
            offsets: offsets.toString(),
            interactions
        }
    }

    getTypedData(domain = getLimitOrderV3Domain(1)): EIP712TypedData {
        return buildOrderData(
            domain.chainId,
            domain.verifyingContract,
            domain.name,
            domain.version,
            this.build()
        )
    }

    getOrderHash(domain = getLimitOrderV3Domain(1)): string {
        return getOrderHash(this.getTypedData(domain))
    }
}
