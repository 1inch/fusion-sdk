import {Address} from '@1inch/limit-order-sdk'
import {AbiCoder} from 'ethers'
import {trim0x} from '@1inch/byte-utils'
import assert from 'assert'

/**
 * The full ABI of `func_nZHTch(address,address,uint256,((address,uint256),uint256,uint256),bytes)`
 * on Permit2Proxy. Its selector (0x23b872dd) collides with `transferFrom(address,address,uint256)`.
 *
 * The LOP calls `_callTransferFromWithSuffix`, appending the suffix after (from, to, amount).
 * We must encode all 5 params and strip the first 3 slots so that the dynamic `bytes` offset
 * remains correct relative to the start of the full parameter block once the contract
 * prepends (from, to, amount).
 */
const FUNC_N_ZH_TCH_ABI = [
    'address',
    'address',
    'uint256',
    'tuple(tuple(address token, uint256 amount) permitted, uint256 nonce, uint256 deadline)',
    'bytes'
]

const ZERO_SLOT = '0'.repeat(64)
const STRIPPED_SLOTS = 3

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
    const abiCoder = AbiCoder.defaultAbiCoder()

    const encoded = abiCoder.encode(FUNC_N_ZH_TCH_ABI, [
        Address.ZERO_ADDRESS.toString(),
        Address.ZERO_ADDRESS.toString(),
        0n,
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

    const strippedHexChars = STRIPPED_SLOTS * 32 * 2

    return '0x' + trim0x(encoded).slice(strippedHexChars)
}

export function decodeTransferFromSuffix(
    suffix: string
): DecodedTransferPermitSuffix {
    const restored = '0x' + ZERO_SLOT.repeat(STRIPPED_SLOTS) + suffix.slice(2)

    const abiCoder = AbiCoder.defaultAbiCoder()
    const decoded = abiCoder.decode(FUNC_N_ZH_TCH_ABI, restored)

    const permit = decoded[3]
    const sig: string = decoded[4]

    assert(sig.length > 0, 'empty permit signature')

    return {
        token: new Address(permit.permitted.token),
        amount: BigInt(permit.permitted.amount),
        nonce: BigInt(permit.nonce),
        deadline: BigInt(permit.deadline),
        signature: sig
    }
}
