import {Address} from '@1inch/limit-order-sdk'
import {verifyTypedData, Wallet} from 'ethers'
import {PermitTransferFrom} from './permit-transfer-from.js'
import {
    PERMIT2_ADDRESS,
    PERMIT2_ADDRESS_ZK,
    PERMIT2_DOMAIN_NAME,
    PERMIT_TRANSFER_FROM_TYPES
} from './constants.js'
import {NetworkEnum} from '../../constants.js'

describe('PermitTransferFrom', () => {
    const token = new Address('0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2')
    const spender = new Address('0x1111111254eeb25477b68fb85ed929f73a960582')
    const maxSpendAmount = 1000000000000000000n
    const nonce = 42n
    const deadline = 1700000000n

    it('should return correct typed data for ethereum', () => {
        const permit = new PermitTransferFrom(
            token,
            maxSpendAmount,
            spender,
            nonce,
            deadline
        )

        const typedData = permit.getTypedData(NetworkEnum.ETHEREUM)

        expect(typedData).toStrictEqual({
            primaryType: 'PermitTransferFrom',
            types: PERMIT_TRANSFER_FROM_TYPES,
            domain: {
                name: PERMIT2_DOMAIN_NAME,
                chainId: NetworkEnum.ETHEREUM,
                verifyingContract: PERMIT2_ADDRESS
            },
            message: {
                permitted: {
                    token: token.toString(),
                    amount: maxSpendAmount
                },
                spender: spender.toString(),
                nonce,
                deadline
            }
        })
    })

    it('should use zksync permit2 address for zksync chain', () => {
        const permit = new PermitTransferFrom(
            token,
            maxSpendAmount,
            spender,
            nonce,
            deadline
        )

        const typedData = permit.getTypedData(NetworkEnum.ZKSYNC)

        expect(typedData.domain.verifyingContract).toBe(PERMIT2_ADDRESS_ZK)
    })

    it('should use custom permit2 address when provided', () => {
        const customPermit2 = '0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'
        const permit = new PermitTransferFrom(
            token,
            maxSpendAmount,
            spender,
            nonce,
            deadline
        )

        const typedData = permit.getTypedData(
            NetworkEnum.ETHEREUM,
            customPermit2
        )

        expect(typedData.domain.verifyingContract).toBe(customPermit2)
    })

    it('should throw for unsupported chain id without custom address', () => {
        const permit = new PermitTransferFrom(
            token,
            maxSpendAmount,
            spender,
            nonce,
            deadline
        )

        expect(() => permit.getTypedData(999)).toThrow('unsupported chainId')
    })

    it('should produce signable typed data that recovers to the signer', async () => {
        const wallet = Wallet.createRandom()
        const permit = new PermitTransferFrom(
            token,
            maxSpendAmount,
            spender,
            nonce,
            deadline
        )

        const typedData = permit.getTypedData(NetworkEnum.ETHEREUM)
        const types = {...typedData.types}
        delete types['EIP712Domain']

        const signature = await wallet.signTypedData(
            typedData.domain,
            types,
            typedData.message
        )

        const recovered = verifyTypedData(
            typedData.domain,
            types,
            typedData.message,
            signature
        )

        expect(recovered).toBe(wallet.address)
    })
})
