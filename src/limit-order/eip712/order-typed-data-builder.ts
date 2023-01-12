import {SignTypedDataVersion, TypedDataUtils} from '@metamask/eth-sig-util'
import {
    EIP712Domain,
    LimitOrderV3TypeDataName,
    LimitOrderV3TypeDataVersion,
    Order,
    VerifyingContract
} from './domain'
import {EIP712DomainType, EIP712TypedData} from './eip712.types'
import {LimitOrderV3Struct} from '../types'

export function getOrderHash(data: EIP712TypedData): string {
    return (
        '0x' +
        TypedDataUtils.eip712Hash(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            data as any,
            SignTypedDataVersion.V4
        ).toString('hex')
    )
}

export function buildOrderData(
    chainId: number,
    verifyingContract: string,
    name: string,
    version: string,
    order: LimitOrderV3Struct
): EIP712TypedData {
    return {
        primaryType: 'Order',
        types: {EIP712Domain, Order},
        domain: {name, version, chainId, verifyingContract},
        message: order
    }
}

export function domainSeparator(
    name: string,
    version: string,
    chainId: number,
    verifyingContract: string
): string {
    return (
        '0x' +
        TypedDataUtils.hashStruct(
            'EIP712Domain',
            {name, version, chainId, verifyingContract},
            {EIP712Domain},
            SignTypedDataVersion.V4
        ).toString('hex')
    )
}

export function getLimitOrderV3Domain(chainId: number): EIP712DomainType {
    return {
        name: LimitOrderV3TypeDataName,
        version: LimitOrderV3TypeDataVersion,
        chainId,
        verifyingContract: VerifyingContract
    }
}
