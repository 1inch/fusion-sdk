import {EIP712TypedData} from '@1inch/limit-order-sdk'
import {Wallet} from 'ethers'
import {BlockchainProviderConnector} from './blockchain-provider.connector.js'
import {Web3Like} from './web3-provider-connector.js'
import {add0x} from '../../utils.js'

export class PrivateKeyProviderConnector
    implements BlockchainProviderConnector
{
    private readonly wallet: Wallet

    constructor(
        readonly privateKey: string,
        protected readonly web3Provider: Web3Like
    ) {
        this.wallet = new Wallet(add0x(privateKey))
    }

    signTypedData(
        _walletAddress: string,
        typedData: EIP712TypedData
    ): Promise<string> {
        const primaryTypes = {...typedData.types}
        delete primaryTypes['EIP712Domain']

        return this.wallet.signTypedData(
            typedData.domain,
            primaryTypes,
            typedData.message
        )
    }

    ethCall(contractAddress: string, callData: string): Promise<string> {
        return this.web3Provider.eth.call({
            to: contractAddress,
            data: callData
        })
    }
}
