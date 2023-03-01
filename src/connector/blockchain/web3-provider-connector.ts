import {BlockchainProviderConnector} from './blockchain-provider.connector'
import Web3 from 'web3'
import {EIP712TypedData} from '../../limit-order'
import {TransactionParams} from './types'
import {LondonGasPrice} from '../../gas-price/london-gas-price'
import {EipGasPrice} from '../../gas-price/types'

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

    sendTransaction(params: Required<TransactionParams>): Promise<string> {
        const {gasPrice, ...remainingParams} = params
        const gp = gasPrice.value.getGasPrice(params.gasPriceMultiplier)
        let transactionConfig = {}

        if (gasPrice.value instanceof LondonGasPrice) {
            transactionConfig = {
                ...remainingParams,
                ...(gp as EipGasPrice)
            }
        } else {
            transactionConfig = {
                ...remainingParams,
                gasPrice: gasPrice.toString()
            }
        }

        return new Promise((resolve, reject) =>
            this.web3Provider.eth
                .sendTransaction(transactionConfig)
                .on('transactionHash', (hash) => resolve(hash))
                .catch((err) => reject(err))
        )
    }
}
