import BN from 'bn.js'

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

    const sig = signature.substr(0, 130)
    const lastByte = signature.substr(130, 2)

    if (lastByte.toLowerCase() === '1b' || lastByte === '00') {
        return sig
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const bnSig = new BN(sig.substring(2 + 64), 'hex').setn(255, true)

    return sig.substring(0, 2 + 64) + bnSig.toString('hex')
}
