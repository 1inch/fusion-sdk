import {BlockchainProviderConnector} from '../connector'

import {decodeNonce, encodeNonce} from './utils'

export class NonceManager {
    public readonly provider: BlockchainProviderConnector

    constructor(blockchainProvider: BlockchainProviderConnector) {
        this.provider = blockchainProvider
    }

    static new(
        blockchainProvider: BlockchainProviderConnector | undefined
    ): NonceManager {
        if (!blockchainProvider) {
            throw new Error('blockchainProvider has not set to config')
        }

        return new NonceManager(blockchainProvider)
    }

    /**
     * @param maker string, address of maker
     */
    async getNonce(maker: string): Promise<string | undefined> {
        const encodedNonce = encodeNonce(maker)

        const nonceHex = await this.provider.ethCall(maker, encodedNonce)

        return decodeNonce(nonceHex)
    }
}
