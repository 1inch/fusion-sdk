import {BN} from '../bn'

export function patchSignature(signature: string): string {
    const isGnosisSafe = signature === '0x'

    if (isGnosisSafe) {
        return signature
    }

    // with 0x (64 len)
    if (signature.length === 130) {
        return signature
    }

    if (signature.length > 132) {
        return signature
    }

    const sig = signature.slice(0, 130)
    const lastByte = signature.slice(130, 132)

    if (lastByte.toLowerCase() === '1b' || lastByte === '00') {
        return sig
    }

    const bnSig = new BN(BigInt(sig.substring(64))).setBit(255n, 1)

    return sig.substring(0, 2 + 64) + bnSig.value.toString(16)
}
