import {BlockchainProviderConnector} from './blockchain-provider.connector'
import Web3 from 'web3'
import {EIP712TypedData} from '../../limit-order'
import {Eip712TypedData} from 'web3-types'

export class Web3ProviderConnector implements BlockchainProviderConnector {
    constructor(protected readonly web3Provider: Web3) {}

    signTypedData(
        walletAddress: string,
        typedData: EIP712TypedData
    ): Promise<string> {
        return this.web3Provider.eth.signTypedData(
            walletAddress,
            typedData as Eip712TypedData
        )
    }

    ethCall(contractAddress: string, callData: string): Promise<string> {
        return this.web3Provider.eth.call({
            to: contractAddress,
            data: callData
        })
    }
}
