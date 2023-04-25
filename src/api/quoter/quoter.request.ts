import {QuoterRequestParams} from './types'
import {isNativeCurrency} from '../../utils'
import {NATIVE_CURRENCY, ZERO_ADDRESS} from '../../constants'
import {isValidAddress, isValidAmount} from '../../validations'

export class QuoterRequest {
    public readonly fromTokenAddress: string

    public readonly toTokenAddress: string

    public readonly amount: string

    public readonly walletAddress: string

    public readonly enableEstimate: boolean

    public readonly permit: string | undefined

    public readonly fee: number | undefined

    public readonly source: string

    constructor(params: QuoterRequestParams) {
        this.fromTokenAddress = params.fromTokenAddress.toLowerCase()
        this.toTokenAddress = params.toTokenAddress.toLowerCase()
        this.amount = params.amount
        this.walletAddress = params.walletAddress.toLowerCase()
        this.enableEstimate = params.enableEstimate || false
        this.permit = params.permit
        this.fee = params.fee
        this.source = params.source || 'sdk'
    }

    static new(params: QuoterRequestParams): QuoterRequest {
        return new QuoterRequest(params)
    }

    validate(): string | null {
        if (isNativeCurrency(this.fromTokenAddress)) {
            return `cannot swap ${NATIVE_CURRENCY}: wrap native currency to it's wrapper fist`
        }

        if (
            this.fromTokenAddress === ZERO_ADDRESS ||
            this.toTokenAddress === ZERO_ADDRESS
        ) {
            return `replace ${ZERO_ADDRESS} with ${NATIVE_CURRENCY}`
        }

        if (this.fromTokenAddress === this.toTokenAddress) {
            return 'fromTokenAddress and toTokenAddress should be different'
        }

        if (!isValidAddress(this.fromTokenAddress)) {
            return `${this.fromTokenAddress} is invalid fromTokenAddress`
        }

        if (!isValidAddress(this.toTokenAddress)) {
            return `${this.toTokenAddress} is invalid toTokenAddress`
        }

        if (!isValidAddress(this.walletAddress)) {
            return `${this.walletAddress} is invalid walletAddress`
        }

        if (!isValidAmount(this.amount)) {
            return `${this.amount} is invalid amount`
        }

        if (this.fee && this.source === 'sdk') {
            return 'cannot use fee without source'
        }

        return null
    }

    build(): QuoterRequestParams {
        return {
            fromTokenAddress: this.fromTokenAddress,
            toTokenAddress: this.toTokenAddress,
            amount: this.amount,
            walletAddress: this.walletAddress,
            enableEstimate: this.enableEstimate,
            permit: this.permit,
            fee: this.fee,
            source: this.source
        }
    }
}
