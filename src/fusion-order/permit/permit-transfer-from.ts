import {Address, EIP712TypedData} from '@1inch/limit-order-sdk'
import {PERMIT2_DOMAIN_NAME, PERMIT_TRANSFER_FROM_TYPES} from './constants.js'
import {getPermit2Address} from './utils.js'
import {encodeTransferFromSuffix} from './transfer-from-suffix.js'

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

    /**
     * ABI-encodes the Permit2 suffix appended to `transferFrom(from,to,amount)` calldata.
     *
     * The limit order protocol calls `_callTransferFromWithSuffix` on the Permit2Proxy,
     * which has `func_nZHTch(address,address,uint256,((address,uint256),uint256,uint256),bytes)`
     * with selector 0x23b872dd (same as transferFrom). The suffix is everything after (from,to,amount).
     */
    public getTransferFromSuffix(signature: string): string {
        return encodeTransferFromSuffix(
            this.token,
            this.maxSpendAmount,
            this.nonce,
            this.deadline,
            signature
        )
    }
}
