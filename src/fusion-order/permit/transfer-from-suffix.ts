import {Address} from '@1inch/limit-order-sdk'
import {AbiCoder} from 'ethers'
import {trim0x} from '@1inch/byte-utils'
import assert from 'assert'

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

/**
 * ABI-encodes the Permit2 suffix appended to `transferFrom(from,to,amount)` calldata.
 *
 * The limit order protocol calls `_callTransferFromWithSuffix` on the Permit2Proxy,
 * which has `func_nZHTch(address,address,uint256,((address,uint256),uint256,uint256),bytes)`
 * with selector 0x23b872dd (same as transferFrom). The suffix is everything after (from,to,amount).
 */
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
