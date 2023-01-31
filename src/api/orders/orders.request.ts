import {ActiveOrdersRequestParams} from './types'

export class ActiveOrdersRequest {
    public readonly page: number | undefined

    public readonly limit: number | undefined

    constructor(params: ActiveOrdersRequestParams) {
        this.page = params.page
        this.limit = params.limit
    }

    static new(params: ActiveOrdersRequestParams): ActiveOrdersRequest {
        return new ActiveOrdersRequest(params)
    }

    build(): ActiveOrdersRequestParams {
        return {
            page: this.page,
            limit: this.limit
        }
    }
}
