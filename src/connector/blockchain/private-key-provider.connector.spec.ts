import {instance, mock} from 'ts-mockito'
import {
    EIP712Domain,
    EIP712TypedData,
    getLimitOrderContract,
    LimitOrderV4Struct,
    LimitOrderV4TypeDataName,
    LimitOrderV4TypeDataVersion,
    Order
} from '@1inch/limit-order-sdk'
import {PrivateKeyProviderConnector} from './private-key-provider.connector'
import {Web3Like} from './web3-provider-connector'

describe('Private Key provider connector', () => {
    let web3Provider: Web3Like
    let privateKeyProviderConnector: PrivateKeyProviderConnector

    const testPrivateKey =
        '0xd8d1f95deb28949ea0ecc4e9a0decf89e98422c2d76ab6e5f736792a388c56c7'

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
            verifyingContract: getLimitOrderContract(1)
        },
        message: limitOrder
    }

    beforeEach(() => {
        web3Provider = mock<Web3Like>()
        privateKeyProviderConnector = new PrivateKeyProviderConnector(
            testPrivateKey,
            instance(web3Provider)
        )
    })

    it('should sign typed data by private key', async () => {
        const walletAddress = '0xa07c1d51497fb6e66aa2329cecb86fca0a957fdb'

        const signature = await privateKeyProviderConnector.signTypedData(
            walletAddress,
            typedData
        )

        expect(signature).toBe(
            '0x8e1cbdc41ebb253aea91bfa41a028e735be4a5b25d93da0e3a6817070f40dcd31dfbc38bd3800ce2ff88089c77ca2f442dc84637006808aab0af00d966c917b11b'
        )
    })
})
