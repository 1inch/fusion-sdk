import {BlockchainProviderConnector} from '../connector'

export enum OrderNonce {
    Auto = 'auto',
    Empty = 'empty'
}

export type NonceRequestParams = {
    maker: string
    blockchainProvider: BlockchainProviderConnector
}
