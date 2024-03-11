import {anything, instance, mock, when} from 'ts-mockito'
import {
    EIP712Domain,
    EIP712TypedData,
    LimitOrderV4Struct,
    LimitOrderV4TypeDataName,
    LimitOrderV4TypeDataVersion,
    Order
} from '@1inch/limit-order-sdk'
import {Web3Like, Web3ProviderConnector} from './web3-provider-connector'
import {VerifyingContract} from '../../../dist'

describe('Web3 provider connector', () => {
    let web3Provider: Web3Like
    let web3ProviderConnector: Web3ProviderConnector

    const limitOrder: LimitOrderV4Struct = {
        salt: '618054093254',
        makerAsset: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
        takerAsset: '0x111111111117dc0aa78b770fa6a738034120c302',
        maker: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
        receiver: '0x0000000000000000000000000000000000000000',
        makingAmount: '1000000000000000000',
        takingAmount: '1000000000000000000',
        makerTraits: '0'
    }

    const typedData: EIP712TypedData = {
        primaryType: 'Order',
        types: {
            EIP712Domain: EIP712Domain,
            Order: Order
        },
        domain: {
            name: LimitOrderV4TypeDataName,
            version: LimitOrderV4TypeDataVersion,
            chainId: 1,
            verifyingContract: VerifyingContract
        },
        message: limitOrder
    }

    beforeEach(() => {
        web3Provider = mock<Web3Like>()
        web3ProviderConnector = new Web3ProviderConnector(
            instance(web3Provider)
        )
    })

    it('should call eth_signTypedData_v4 rpc method', async () => {
        const walletAddress = '0xasd'

        const extendedWeb3 = {
            signTypedDataV4: jest.fn()
        }

        when(web3Provider.extend(anything())).thenReturn(extendedWeb3)

        await web3ProviderConnector.signTypedData(walletAddress, typedData)

        expect(extendedWeb3.signTypedDataV4).toHaveBeenCalledWith(
            walletAddress,
            JSON.stringify(typedData)
        )
    })
})
