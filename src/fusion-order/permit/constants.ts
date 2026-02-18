import {EIP712Types} from '@1inch/limit-order-sdk'
import {NetworkEnum} from '../../constants.js'

const PERMIT2_ADDRESS = '0x000000000022D473030F116dDEE9F6B43aC78BA3'
const PERMIT2_ADDRESS_ZK = '0x0000000000225e31d15943971f47ad3022f714fa'

export const PERMIT2_ADDRESSES: Record<NetworkEnum, string> = {
    [NetworkEnum.ZKSYNC]: PERMIT2_ADDRESS_ZK,
    [NetworkEnum.ARBITRUM]: PERMIT2_ADDRESS,
    [NetworkEnum.ETHEREUM]: PERMIT2_ADDRESS,
    [NetworkEnum.POLYGON]: PERMIT2_ADDRESS,
    [NetworkEnum.BINANCE]: PERMIT2_ADDRESS,
    [NetworkEnum.AVALANCHE]: PERMIT2_ADDRESS,
    [NetworkEnum.OPTIMISM]: PERMIT2_ADDRESS,
    [NetworkEnum.FANTOM]: PERMIT2_ADDRESS,
    [NetworkEnum.GNOSIS]: PERMIT2_ADDRESS,
    [NetworkEnum.COINBASE]: PERMIT2_ADDRESS,
    [NetworkEnum.LINEA]: PERMIT2_ADDRESS,
    [NetworkEnum.SONIC]: PERMIT2_ADDRESS,
    [NetworkEnum.UNICHAIN]: PERMIT2_ADDRESS
}

export const PERMIT2_DOMAIN_NAME = 'Permit2'

export const TOKEN_PERMISSIONS: EIP712Types = {
    TokenPermissions: [
        {name: 'token', type: 'address'},
        {name: 'amount', type: 'uint256'}
    ]
}

export const PERMIT_TRANSFER_FROM_TYPES: EIP712Types = {
    PermitTransferFrom: [
        {name: 'permitted', type: 'TokenPermissions'},
        {name: 'spender', type: 'address'},
        {name: 'nonce', type: 'uint256'},
        {name: 'deadline', type: 'uint256'}
    ],
    ...TOKEN_PERMISSIONS
}
