import {BlockchainProviderConnector} from '../connector'

export enum OrderNonce {
    Auto = 'auto'
}

export type NonceManagerConfig = {
    provider: BlockchainProviderConnector
    limitOrderProtocolContract?: string
}
