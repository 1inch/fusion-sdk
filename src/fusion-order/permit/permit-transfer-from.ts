import {Address, EIP712TypedData} from '@1inch/limit-order-sdk'
import {AbiCoder} from 'ethers'
import {trim0x} from '@1inch/byte-utils'
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

    /**
     * ABI-encodes the Permit2 suffix appended to `transferFrom(from,to,amount)` calldata.
     *
     * The limit order protocol calls `_callTransferFromWithSuffix` on the Permit2Proxy,
     * which has `func_nZHTch(address,address,uint256,((address,uint256),uint256,uint256),bytes)`
     * with selector 0x23b872dd (same as transferFrom). The suffix is everything after (from,to,amount).
     */
    public getTransferFromSuffix(signature: string): string {
        const abiCoder = AbiCoder.defaultAbiCoder()

        const encoded = abiCoder.encode(
            [
                'tuple(tuple(address token, uint256 amount) permitted, uint256 nonce, uint256 deadline)',
                'bytes'
            ],
            [
                {
                    permitted: {
                        token: this.token.toString(),
                        amount: this.maxSpendAmount
                    },
                    nonce: this.nonce,
                    deadline: this.deadline
                },
                signature
            ]
        )

        const STRIPPED_HEAD_BYTES = 3 * 32

        return '0x' + trim0x(encoded).slice(STRIPPED_HEAD_BYTES * 2)
    }
}
