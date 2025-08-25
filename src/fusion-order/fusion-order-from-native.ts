import {Address, OrderInfoData} from '@1inch/limit-order-sdk'
import {CHAIN_TO_WRAPPER} from './constants.js'
import {FusionOrder} from './fusion-order.js'
import {Details, Extra} from './types.js'
import {FusionExtension} from './fusion-extension.js'
import {SurplusParams} from './surplus-params.js'
import {Whitelist} from './whitelist/whitelist.js'
import {AuctionDetails} from './auction-details/auction-details.js'
import {NetworkEnum} from '../constants.js'

/**
 * Fusion order from native currency
 *
 * Note, that such order should be submitted onchain through `ETHOrders.depositForOrder` AND offchain through submit to relayer
 *
 * @see ETHOrders.depositForOrder https://github.com/1inch/limit-order-protocol/blob/c100474444cd71cf7989cd8a63f375e72656b8b4/contracts/extensions/ETHOrders.sol#L89
 */
export class FusionOrderFromNative extends FusionOrder {
    constructor(
        public readonly realMaker: Address,
        /**
         * Fusion extension address
         * @see https://github.com/1inch/limit-order-settlement
         */
        settlementExtensionContract: Address,
        orderInfo: OrderInfoData,
        auctionDetails: AuctionDetails,
        whitelist: Whitelist,
        surplusParams?: SurplusParams,
        extra?: Extra,
        extension?: FusionExtension
    ) {
        super(
            settlementExtensionContract,
            orderInfo,
            auctionDetails,
            whitelist,
            surplusParams,
            extra,
            extension
        )
    }

    /**
     * Create new order from native asset
     */
    static fromNative(
        chainId: NetworkEnum,
        ethOrdersExtension: Address,
        /**
         * Fusion extension address
         * @see https://github.com/1inch/limit-order-settlement
         */
        settlementExtension: Address,
        orderInfo: Omit<OrderInfoData, 'makerAsset'>,
        details: Details,
        extra?: Extra
    ): FusionOrderFromNative {
        const _orderInfo: OrderInfoData = {
            ...orderInfo,
            makerAsset: CHAIN_TO_WRAPPER[chainId],
            receiver: orderInfo.receiver || orderInfo.maker,
            maker: ethOrdersExtension
        }

        return new FusionOrderFromNative(
            orderInfo.maker,
            settlementExtension,
            _orderInfo,
            details.auction,
            details.whitelist,
            details.surplus,
            extra
        )
    }
}
