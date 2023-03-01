import {EIP712TypedData} from '../../limit-order'
import {TransactionParams} from './types'

export interface BlockchainProviderConnector {
    signTypedData(
        walletAddress: string,
        typedData: EIP712TypedData
    ): Promise<string>

    ethCall(contractAddress: string, callData: string): Promise<string>

    sendTransaction(params: Required<TransactionParams>): Promise<string>
}
