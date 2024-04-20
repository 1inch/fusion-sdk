import {NonceManager} from './nonce-manager'
import {BlockchainProviderConnector} from '../connector'
import {EIP712TypedData} from '../limit-order'

describe('Nonce Manager', () => {
    const provider: BlockchainProviderConnector = jest.fn().mockReturnValue({
        signTypedData: (
            _walletAddress: string,
            _typedData: EIP712TypedData
        ): Promise<string> => {
            return Promise.resolve('0x')
        },

        ethCall: (
            _contractAddress: string,
            _callData: string
        ): Promise<string> => {
            return Promise.resolve(
                '0x0000000000000000000000000000000000000000000000000000000000000005'
            )
        }
    })()

    it.only('should get nonce', async () => {
        const nonceManager = NonceManager.new({provider})
        const nonce = await nonceManager.getNonce(
            '0xfb3c7eb936cAA12B5A884d612393969A557d4307'
        )
        expect(nonce).toBe('5')
    })
})
