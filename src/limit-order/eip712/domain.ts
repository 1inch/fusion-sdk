import {ONE_INCH_LIMIT_ORDER_V4} from '../../constants'

export const EIP712Domain = [
    {name: 'name', type: 'string'},
    {name: 'version', type: 'string'},
    {name: 'chainId', type: 'uint256'},
    {name: 'verifyingContract', type: 'address'}
]

export const Order = [
    {name: 'salt', type: 'uint256'},
    {name: 'maker', type: 'address'},
    {name: 'receiver', type: 'address'},
    {name: 'makerAsset', type: 'address'},
    {name: 'takerAsset', type: 'address'},
    {name: 'makingAmount', type: 'uint256'},
    {name: 'takingAmount', type: 'uint256'},
    {name: 'makerTraits', type: 'uint256'}
]

export const LimitOrderV3TypeDataName = '1inch Aggregation Router'
export const LimitOrderV4TypeDataVersion = '6'
export const VerifyingContract = ONE_INCH_LIMIT_ORDER_V4
