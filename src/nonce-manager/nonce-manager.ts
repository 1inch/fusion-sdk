import {decodeNonce, encodeNonce} from './utils'
import {NonceManagerConfig} from './types'
import {ONE_INCH_LIMIT_ORDER_V4} from '../constants'

export class NonceManager {
    constructor(private readonly config: NonceManagerConfig) {}

    static new(config: NonceManagerConfig): NonceManager {
        return new NonceManager(config)
    }

    /**
     * @param maker string, address of maker
     */
    async getNonce(maker: string): Promise<string> {
        const encodedCall = encodeNonce(maker)

        const nonceHex = await this.config.provider.ethCall(
            this.config.limitOrderProtocolContract || ONE_INCH_LIMIT_ORDER_V4,
            encodedCall
        )

        return decodeNonce(nonceHex)
    }
}
