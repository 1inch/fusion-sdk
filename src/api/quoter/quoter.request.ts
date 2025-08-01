import {Address} from '@1inch/limit-order-sdk'
import {QuoterRequestParams, QuoterRequestParamsRaw} from './types.js'
import {IntegratorFeeParams} from './quote/index.js'
import {isValidAmount} from '../../validations.js'

export class QuoterRequest {
    public readonly fromTokenAddress: Address

    public readonly toTokenAddress: Address

    public readonly amount: string

    public readonly walletAddress: Address

    public readonly enableEstimate: boolean

    public readonly permit: string | undefined

    public readonly integratorFee?: IntegratorFeeParams

    public readonly source: string

    public readonly isPermit2: boolean

    public readonly slippage?: number

    constructor(params: QuoterRequestParams) {
        this.fromTokenAddress = new Address(params.fromTokenAddress)
        this.toTokenAddress = new Address(params.toTokenAddress)
        this.amount = params.amount
        this.walletAddress = new Address(params.walletAddress)
        this.enableEstimate = params.enableEstimate || false
        this.permit = params.permit
        this.integratorFee = params.integratorFee
        this.source = params.source || 'sdk'
        this.isPermit2 = params.isPermit2 ?? false
        this.slippage = params.slippage

        if (this.fromTokenAddress.isNative()) {
            throw new Error(
                `cannot swap ${Address.NATIVE_CURRENCY}: wrap native currency to it's wrapper fist`
            )
        }

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

        if (this.integratorFee && this.source === 'sdk') {
            throw new Error('cannot use fee without source')
        }
    }

    static new(params: QuoterRequestParams): QuoterRequest {
        return new QuoterRequest(params)
    }

    build(): QuoterRequestParamsRaw {
        return {
            fromTokenAddress: this.fromTokenAddress.toString(),
            toTokenAddress: this.toTokenAddress.toString(),
            amount: this.amount,
            walletAddress: this.walletAddress.toString(),
            enableEstimate: this.enableEstimate,
            permit: this.permit,
            fee: Number(this.integratorFee?.value.value || 0),
            source: this.source,
            isPermit2: this.isPermit2,
            surplus: true,
            slippage: this.slippage
        }
    }
}
