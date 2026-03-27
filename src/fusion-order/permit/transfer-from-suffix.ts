import {Address} from '@1inch/limit-order-sdk'
import {AbiCoder} from 'ethers'
import assert from 'assert'

/**
 * Permit2Proxy exposes `func_nZHTch(address,address,uint256,((address,uint256),uint256,uint256),bytes)`
 * whose selector collides with `transferFrom(address,address,uint256)` (0x23b872dd).
 * The LOP calls `_callTransferFromWithSuffix`, appending these extra params as raw suffix bytes.
 */
const PERMIT2_TRANSFER_FROM_EXTRA_PARAMS_ABI = [
    'tuple(tuple(address token, uint256 amount) permitted, uint256 nonce, uint256 deadline)',
    'bytes'
]

const abiCoder = AbiCoder.defaultAbiCoder()

export type DecodedTransferPermitSuffix = {
    token: Address
    amount: bigint
    nonce: bigint
    deadline: bigint
    signature: string
}

export function encodeTransferFromSuffix(
    token: Address,
    amount: bigint,
    nonce: bigint,
    deadline: bigint,
    signature: string
): string {
    return abiCoder.encode(PERMIT2_TRANSFER_FROM_EXTRA_PARAMS_ABI, [
        {
            permitted: {
                token: token.toString(),
                amount
            },
            nonce,
            deadline
        },
        signature
    ])
}

export function decodeTransferFromSuffix(
    suffix: string
): DecodedTransferPermitSuffix {
    const decoded = abiCoder.decode(
        PERMIT2_TRANSFER_FROM_EXTRA_PARAMS_ABI,
        suffix
    )

    const permit = decoded[0]
    const sig: string = decoded[1]

    assert(sig.length > 0, 'empty permit signature')

    return {
        token: new Address(permit.permitted.token),
        amount: BigInt(permit.permitted.amount),
        nonce: BigInt(permit.nonce),
        deadline: BigInt(permit.deadline),
        signature: sig
    }
}
