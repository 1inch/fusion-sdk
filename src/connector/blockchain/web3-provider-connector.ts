import {BlockchainProviderConnector} from './blockchain-provider.connector'
import Web3 from 'web3'
import {EIP712TypedData} from '../../limit-order'
import {TransactionParams} from './types'

interface ExtendedWeb3 extends Web3 {
    signTypedDataV4(walletAddress: string, typedData: string): Promise<string>
}

export class Web3ProviderConnector implements BlockchainProviderConnector {
    constructor(protected readonly web3Provider: Web3) {}

    signTypedData(
        walletAddress: string,
        typedData: EIP712TypedData
    ): Promise<string> {
        const extendedWeb3: ExtendedWeb3 = this.web3Provider.extend({
            methods: [
                {
                    name: 'signTypedDataV4',
                    call: 'eth_signTypedData_v4',
                    params: 2
                }
            ]
        })

        return extendedWeb3.signTypedDataV4(
            walletAddress,
            JSON.stringify(typedData)
        )
    }

    ethCall(contractAddress: string, callData: string): Promise<string> {
        return this.web3Provider.eth.call({
            to: contractAddress,
            data: callData
        })
    }

    // todo: fix this
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    signTransaction(params: Required<TransactionParams>): string {
        return 'something'
    }
}
