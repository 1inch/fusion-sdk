import {Address} from '@1inch/limit-order-sdk'
import {QuoterRequestParams} from './types'
import {isValidAmount} from '../../validations'

export class QuoterRequest {
    public readonly fromTokenAddress: Address

    public readonly toTokenAddress: Address

    public readonly amount: string

    public readonly walletAddress: Address

    public readonly enableEstimate: boolean

    public readonly permit: string | undefined

    public readonly fee: number | undefined

    public readonly source: string

    public readonly isPermit2: boolean

    constructor(params: QuoterRequestParams) {
        this.fromTokenAddress = new Address(params.fromTokenAddress)
        this.toTokenAddress = new Address(params.toTokenAddress)
        this.amount = params.amount
        this.walletAddress = new Address(params.walletAddress)
        this.enableEstimate = params.enableEstimate || false
        this.permit = params.permit
        this.fee = params.fee
        this.source = params.source || 'sdk'
        this.isPermit2 = params.isPermit2 ?? false

        if (this.fromTokenAddress.isZero() || this.toTokenAddress.isZero()) {
            throw new Error(
                `replace ${Address.ZERO_ADDRESS} with ${Address.NATIVE_CURRENCY}`
            )
        }

        if (this.fromTokenAddress.equal(this.toTokenAddress)) {
            throw new Error(
                'fromTokenAddress and toTokenAddress should be different'
            )
        }

        if (!isValidAmount(this.amount)) {
            throw new Error(`${this.amount} is invalid amount`)
        }

        if (this.fee && this.source === 'sdk') {
            throw new Error('cannot use fee without source')
        }
    }

    static new(params: QuoterRequestParams): QuoterRequest {
        return new QuoterRequest(params)
    }

    build(): QuoterRequestParams {
        return {
            fromTokenAddress: this.fromTokenAddress.toString(),
            toTokenAddress: this.toTokenAddress.toString(),
            amount: this.amount,
            walletAddress: this.walletAddress.toString(),
            enableEstimate: this.enableEstimate,
            permit: this.permit,
            fee: this.fee,
            source: this.source,
            isPermit2: this.isPermit2
        }
    }
}
