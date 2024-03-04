import {SignTypedDataVersion, TypedDataUtils} from '@metamask/eth-sig-util'
import {
    EIP712Domain,
    LimitOrderV4TypeDataName,
    LimitOrderV4TypeDataVersion,
    Order,
    VerifyingContract
} from './domain'
import {EIP712DomainType, EIP712TypedData} from './eip712.types'
import {LimitOrderV4Struct} from '../types'

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

export function buildOrderTypedData(
    chainId: number,
    verifyingContract: string,
    name: string,
    version: string,
    order: LimitOrderV4Struct
): EIP712TypedData {
    return {
        primaryType: 'Order',
        types: {EIP712Domain, Order},
        domain: {name, version, chainId, verifyingContract},
        message: order
    }
}

export function getDomainSeparator(
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

export function getLimitOrderV4Domain(chainId: number): EIP712DomainType {
    return {
        name: LimitOrderV4TypeDataName,
        version: LimitOrderV4TypeDataVersion,
        chainId,
        verifyingContract: VerifyingContract
    }
}
