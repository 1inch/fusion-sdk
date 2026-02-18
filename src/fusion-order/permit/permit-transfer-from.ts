import {Address, EIP712TypedData} from '@1inch/limit-order-sdk'
import {PERMIT2_DOMAIN_NAME, PERMIT_TRANSFER_FROM_TYPES} from './constants.js'
import {getPermit2Address} from './utils.js'

export class PermitTransferFrom {
    constructor(
        public readonly token: Address,
        public readonly maxSpendAmount: bigint,
        public readonly spender: Address,
        public readonly nonce: bigint,
        public readonly deadline: bigint
    ) {}

    getTypedData(
        chainId: number,
        permit2Address: string = getPermit2Address(chainId)
    ): EIP712TypedData {
        return {
            primaryType: 'PermitTransferFrom',
            types: {
                ...PERMIT_TRANSFER_FROM_TYPES
            },
            domain: {
                name: PERMIT2_DOMAIN_NAME,
                chainId,
                verifyingContract: permit2Address
            },
            message: {
                permitted: {
                    token: this.token.toString(),
                    amount: this.maxSpendAmount
                },
                spender: this.spender.toString(),
                nonce: this.nonce,
                deadline: this.deadline
            }
        }
    }
}
