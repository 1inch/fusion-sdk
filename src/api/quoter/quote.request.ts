import {QuoterRequestParams} from './types'

export class QuoteRequest {
    public readonly fromTokenAddress: string

    public readonly toTokenAddress: string

    public readonly amount: string

    public readonly walletAddress: string

    public readonly enableEstimate: boolean

    public readonly permit: string | undefined

    constructor(params: QuoterRequestParams) {
        this.fromTokenAddress = params.fromTokenAddress
        this.toTokenAddress = params.toTokenAddress
        this.amount = params.amount
        this.walletAddress = params.walletAddress
        this.enableEstimate = params.enableEstimate || false
        this.permit = params.permit
    }

    static new(params: QuoterRequestParams): QuoteRequest {
        return new QuoteRequest(params)
    }

    build(): QuoterRequestParams {
        return {
            fromTokenAddress: this.fromTokenAddress,
            toTokenAddress: this.toTokenAddress,
            amount: this.amount,
            walletAddress: this.walletAddress,
            enableEstimate: this.enableEstimate,
            permit: this.permit
        }
    }
}
