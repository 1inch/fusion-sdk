import {BlockchainProviderConnector} from './blockchain-provider.connector'
import {signTypedData, SignTypedDataVersion} from '@metamask/eth-sig-util'
import {Web3Like} from './web3-provider-connector'
import {EIP712TypedData} from '@1inch/limit-order-sdk'

export class PrivateKeyProviderConnector
    implements BlockchainProviderConnector
{
    private readonly privateKeyBuffer: Buffer

    constructor(
        readonly privateKey: string,
        protected readonly web3Provider: Web3Like
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
}
