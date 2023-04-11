import {getCrypto} from '../utils'

export function randomIntString(length: number): string {
    const bytes = new Uint8Array(length)
    const result = []
    const charset = '0123456789'

    const cryptoObj = getCrypto()

    if (!cryptoObj) {
        throw new Error("Can't find crypto object")
    }

    const random = cryptoObj.getRandomValues(bytes)

    for (let a = 0; a < random.length; a++) {
        if (a === 0) {
            result.push(charset[(random[a] % (charset.length - 1)) + 1])
        } else {
            result.push(charset[random[a] % charset.length])
        }
    }

    return result.join('')
}
