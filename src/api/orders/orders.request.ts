import {isValidAddress} from '../../validations'
import {
    ActiveOrdersRequestParams,
    OrdersByMakerParams,
    OrdersByMakerQueryParams,
    OrderStatusParams
} from './types'
import Web3 from 'web3'

export class ActiveOrdersRequest {
    public readonly page: number | undefined

    public readonly limit: number | undefined

    constructor(params: ActiveOrdersRequestParams = {}) {
        this.page = params.page
        this.limit = params.limit
    }

    static new(params?: ActiveOrdersRequestParams): ActiveOrdersRequest {
        return new ActiveOrdersRequest(params)
    }

    build(): ActiveOrdersRequestParams {
        return {
            page: this.page,
            limit: this.limit
        }
    }
}

export class OrderStatusRequest {
    public readonly orderHash: string

    constructor(params: OrderStatusParams) {
        this.orderHash = params.orderHash
    }

    static new(params: OrderStatusParams): OrderStatusRequest {
        return new OrderStatusRequest(params)
    }

    validate(): string | null {
        if (this.orderHash.length !== 66) {
            return `orderHash length should be equals 66`
        }

        if (!Web3.utils.isHex(this.orderHash)) {
            return `orderHash have to be hex`
        }

        return null
    }

    build(): OrderStatusParams {
        return {
            orderHash: this.orderHash
        }
    }
}

export class OrdersByMakerRequest {
    public readonly address: string

    public readonly page: number | undefined

    public readonly limit: number | undefined

    constructor(params: OrdersByMakerParams) {
        this.address = params.address
        this.limit = params.limit
        this.page = params.page
    }

    static new(params: OrdersByMakerParams): OrdersByMakerRequest {
        return new OrdersByMakerRequest(params)
    }

    validate(): string | null {
        if (!isValidAddress(this.address)) {
            return `${this.address} is invalid address`
        }

        return null
    }

    buildQueryParams(): OrdersByMakerQueryParams {
        return {
            limit: this.limit,
            page: this.page
        }
    }
}
