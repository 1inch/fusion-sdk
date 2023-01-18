import {EIP712TypedData} from '../../limit-order'

export interface BlockchainProviderConnector {
    signTypedData(
        walletAddress: string,
        typedData: EIP712TypedData
    ): Promise<string>

    ethCall(contractAddress: string, callData: string): Promise<string>
}
