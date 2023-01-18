import {anything, instance, mock, when} from 'ts-mockito'
import Web3 from 'web3'
import {
    EIP712Domain,
    EIP712TypedData,
    LimitOrderV3Struct,
    LimitOrderV3TypeDataName,
    LimitOrderV3TypeDataVersion,
    Order,
    VerifyingContract
} from '../limit-order'
import {Web3ProviderConnector} from './web3-provider-connector'

describe('Web3 provider connector', () => {
    let web3Provider: Web3
    let web3ProviderConnector: Web3ProviderConnector

    const limitOrder: LimitOrderV3Struct = {
        salt: '618054093254',
        makerAsset: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
        takerAsset: '0x111111111117dc0aa78b770fa6a738034120c302',
        maker: '0xfb3c7eb936cAA12B5A884d612393969A557d4307',
        receiver: '0x0000000000000000000000000000000000000000',
        allowedSender: '0x0000000000000000000000000000000000000000',
        makingAmount: '1000000000000000000',
        takingAmount: '1000000000000000000',
        offsets:
            '9813420589127697917471531885823684359047649055178615469676279994777600',
        // eslint-disable-next-line max-len
        interactions:
            '0x20b83f2d0000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000de0b6b3a76400007e2d21830000000000000000000000000000000000000000000000000de0b6b3a76400000000000000000000000000000000000000000000000000000de0b6b3a7640000bfa7514300000000000000000000000000000000000000000000000000000068000000240000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006863592c2b0000000000000000000000000000000000000000000000000000000063593ad9cf6fc6e3000000000000000000000000fb3c7eb936caa12b5a884d612393969a557d43070000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000'
    }

    const typedData: EIP712TypedData = {
        primaryType: 'Order',
        types: {
            EIP712Domain: EIP712Domain,
            Order: Order
        },
        domain: {
            name: LimitOrderV3TypeDataName,
            version: LimitOrderV3TypeDataVersion,
            chainId: 1,
            verifyingContract: VerifyingContract
        },
        message: limitOrder
    }

    beforeEach(() => {
        web3Provider = mock<Web3>()
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
