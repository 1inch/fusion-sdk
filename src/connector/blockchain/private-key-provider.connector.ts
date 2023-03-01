import {BlockchainProviderConnector} from './blockchain-provider.connector'
import Web3 from 'web3'
import {signTypedData, SignTypedDataVersion} from '@metamask/eth-sig-util'
import {FeeMarketEIP1559Transaction, Transaction} from '@ethereumjs/tx'
import {EIP712TypedData} from '../../limit-order'
import {decimalToHex} from './utils/blockchain.utils'
import {TransactionParams} from './types'
import {LondonGasPrice} from '../../gas-price/london-gas-price'
import {getOptions} from './config/chain.config'
import {LegacyGasPrice} from '../../gas-price/legacy-gas-price'
import {add0x} from '../../utils'

export class PrivateKeyProviderConnector
    implements BlockchainProviderConnector
{
    private readonly privateKeyBuffer: Buffer

    constructor(
        readonly privateKey: string,
        protected readonly web3Provider: Web3
    ) {
        this.privateKeyBuffer = Buffer.from(privateKey.replace('0x', ''), 'hex')
    }

    signTypedData(
        _walletAddress: string,
        typedData: EIP712TypedData
    ): Promise<string> {
        const result = signTypedData({
            privateKey: this.privateKeyBuffer,
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            data: typedData,
            version: SignTypedDataVersion.V4
        })

        return Promise.resolve(result)
    }

    ethCall(contractAddress: string, callData: string): Promise<string> {
        return this.web3Provider.eth.call({
            to: contractAddress,
            data: callData
        })
    }

    signTransaction(params: Required<TransactionParams>): string {
        const gasPriceValue = params.gasPrice.value

        if (gasPriceValue instanceof LondonGasPrice) {
            return this.signTransactionWithLondonGasPrice(params)
        }

        return this.signTransactionWithLegacyGasPrice(params)
    }

    sendTransaction(rawTx: string): Promise<string> {
        return new Promise((resolve, reject) =>
            this.web3Provider.eth
                .sendSignedTransaction(add0x(rawTx))
                .on('transactionHash', (hash) => resolve(hash))
                .catch((err) => reject(err))
        )
    }

    private signTransactionWithLondonGasPrice(
        params: Required<TransactionParams>
    ): string {
        const tx = this.getLondonGasTransaction(params)

        return tx.sign(this.privateKeyBuffer).serialize().toString('hex')
    }

    private signTransactionWithLegacyGasPrice(
        params: Required<TransactionParams>
    ): string {
        const tx = this.getLegacyGasTransaction(params)

        return tx.sign(this.privateKeyBuffer).serialize().toString('hex')
    }

    private getLegacyGasTransaction(
        params: Required<TransactionParams>
    ): Transaction {
        const gasPriceValue = params.gasPrice.value as LegacyGasPrice
        const gasPrice = gasPriceValue.getGasPrice(params.gasPriceMultiplier)

        return new Transaction(
            {
                nonce: decimalToHex(params.nonce),
                gasPrice: decimalToHex(gasPrice),
                gasLimit: decimalToHex(params.gasLimit),
                to: params.to,
                value: decimalToHex(params.value.toString()),
                data: params.data
            },
            getOptions(params?.network)
        )
    }

    private getLondonGasTransaction(
        params: Required<TransactionParams>
    ): FeeMarketEIP1559Transaction {
        const gasPriceValue = params.gasPrice.value as LondonGasPrice
        const gasPrice = gasPriceValue.getGasPrice(params.gasPriceMultiplier)

        return new FeeMarketEIP1559Transaction(
            {
                nonce: decimalToHex(params.nonce),
                maxPriorityFeePerGas: decimalToHex(
                    gasPrice.maxPriorityFeePerGas
                ),
                maxFeePerGas: decimalToHex(gasPrice.maxFeePerGas),
                gasLimit: decimalToHex(params.gasLimit),
                to: params.to,
                value: decimalToHex(params.value.toString()),
                data: params.data
            },
            getOptions(params?.network)
        )
    }
}
