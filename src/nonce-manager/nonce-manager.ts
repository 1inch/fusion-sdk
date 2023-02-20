import {BlockchainProviderConnector} from '../connector'

import {decodeNonce, encodeNonce} from './utils'

export class NonceManager {
    public readonly provider: BlockchainProviderConnector

    constructor(blockchainProvider: BlockchainProviderConnector) {
        this.provider = blockchainProvider
    }

    static new(blockchainProvider: BlockchainProviderConnector): NonceManager {
        return new NonceManager(blockchainProvider)
    }

    /**
     * @param maker string, address of maker
     */
    async getNonce(maker: string): Promise<string> {
        const encodedNonce = encodeNonce(maker)

        const nonceHex = await this.provider.ethCall(maker, encodedNonce)

        return decodeNonce(nonceHex)
    }
}
