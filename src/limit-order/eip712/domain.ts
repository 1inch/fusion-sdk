import {ONE_INCH_ROUTER_V5} from '../../constants'

export const EIP712Domain = [
    {name: 'name', type: 'string'},
    {name: 'version', type: 'string'},
    {name: 'chainId', type: 'uint256'},
    {name: 'verifyingContract', type: 'address'}
]

export const Order = [
    {name: 'salt', type: 'uint256'},
    {name: 'makerAsset', type: 'address'},
    {name: 'takerAsset', type: 'address'},
    {name: 'maker', type: 'address'},
    {name: 'receiver', type: 'address'},
    {name: 'allowedSender', type: 'address'},
    {name: 'makingAmount', type: 'uint256'},
    {name: 'takingAmount', type: 'uint256'},
    {name: 'offsets', type: 'uint256'},
    {name: 'interactions', type: 'bytes'}
]

export const LimitOrderV3TypeDataName = '1inch Aggregation Router'
export const LimitOrderV3TypeDataVersion = '5'
export const VerifyingContract = ONE_INCH_ROUTER_V5
