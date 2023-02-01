import {isValidAddress} from '../../validations'
import {
    ActiveOrdersRequestParams,
    OrdersByMakerParams,
    OrdersByMakerQueryParams,
    OrderStatusParams
} from './types'
import Web3 from 'web3'
import {PaginationRequest} from '../pagination'

export class ActiveOrdersRequest {
    public readonly pagination: PaginationRequest

    constructor(params: ActiveOrdersRequestParams = {}) {
        this.pagination = new PaginationRequest(params.page, params.limit)
    }

    static new(params?: ActiveOrdersRequestParams): ActiveOrdersRequest {
        return new ActiveOrdersRequest(params)
    }

    build(): ActiveOrdersRequestParams {
        return {
            page: this.pagination.page,
            limit: this.pagination.limit
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

    public readonly pagination: PaginationRequest

    constructor(params: OrdersByMakerParams) {
        this.address = params.address
        this.pagination = new PaginationRequest(params.page, params.limit)
    }

    static new(params: OrdersByMakerParams): OrdersByMakerRequest {
        return new OrdersByMakerRequest(params)
    }

    validate(): string | null {
        const res = this.pagination.validate()

        if (res) {
            return res
        }

        if (!isValidAddress(this.address)) {
            return `${this.address} is invalid address`
        }

        return null
    }

    buildQueryParams(): OrdersByMakerQueryParams {
        return {
            limit: this.pagination.limit,
            page: this.pagination.page
        }
    }
}
