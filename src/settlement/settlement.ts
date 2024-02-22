import {FillOrderParams, SettlementConfig} from './types'
import {
    buildRecursiveFillInteraction,
    buildResolveOrdersBytes,
    encodeSettleOrders,
    encodeSettleOrdersParam
} from './encoders'

export class Settlement {
    constructor(private readonly config: SettlementConfig) {}

    encodeSettleOrders(
        // sorted by: orders[0] executes first, orders[orders.length - 1] executes last
        orders: FillOrderParams[],
        resolverExecutionBytes: string
    ): string {
        const data = this.encodeSettleOrdersParam(
            orders,
            resolverExecutionBytes
        )

        return encodeSettleOrders(data)
    }

    encodeSettleOrdersParam(
        // sorted by: orders[0] executes first, orders[orders.length - 1] executes last
        orders: FillOrderParams[],
        resolverExecutionBytes: string
    ): string {
        const finalActionBytes = buildResolveOrdersBytes(
            this.config.settlementExtension,
            this.config.resolverContract,
            resolverExecutionBytes
        )

        const interaction = orders
            .slice(1)
            .reverse()
            .reduce((acc, fillParams) => {
                return buildRecursiveFillInteraction(
                    this.config.settlementExtension,
                    {
                        ...fillParams,
                        interaction: acc
                    }
                )
            }, finalActionBytes)

        return encodeSettleOrdersParam({
            ...orders[0],
            interaction
        })
    }
}
