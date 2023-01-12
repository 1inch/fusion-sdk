import {toBN, trim0x} from '../utils';
import {LimitOrderV3TypeDataName, LimitOrderV3TypeDataVersion} from './eip712/domain';
import {buildOrderData, getOrderHash} from './eip712/order-typed-data-builder';
import {EIP712TypedData} from './eip712/eip712.types';
import {ZERO_ADDRESS, ZX} from '../constants';
import {buildSalt} from './utils';
import {InteractionsData, LimitOrderV3Struct, OrderInfoData} from './types';

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

    static getOrderHash(order: LimitOrderV3Struct): string {
        return getOrderHash(LimitOrder.getTypedData(order))
    }

    static getTypedData(order: LimitOrderV3Struct): EIP712TypedData {
        return buildOrderData(
            1,
            '',
            // config.network_chain_id,
            // config.chain.web3.limit_order_protocol_v3.address,
            LimitOrderV3TypeDataName,
            LimitOrderV3TypeDataVersion,
            order
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
        const cumulativeSum = ((sum) => (value: number) => {
            sum += value

            return sum
        })(0)

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
}
