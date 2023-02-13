import Contract from 'web3-eth-contract'
import {AbiItem} from 'web3-utils'
import {BlockchainProviderConnector} from '../connector'
import {NonceRequestParams, OrderNonce} from './types'
import LimitOrderV3ABI from '../abi/AggregationRouterV5.abi.json'
import {decodeNonce, encodeNonce} from './utils'

export class NonceManager {
    public readonly makerAddress: string

    public readonly provider: BlockchainProviderConnector

    public readonly limitOrderV3Contract: Contract.Contract

    constructor(params: NonceRequestParams) {
        this.makerAddress = params.maker
        this.provider = params.blockchainProvider

        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.limitOrderV3Contract = new Contract(LimitOrderV3ABI as AbiItem[])
    }

    static new(params: NonceRequestParams): NonceManager {
        return new NonceManager(params)
    }

    /**
     * @param nonceRequestType enum OrderNonce, either Auto or Empty, in case of Empty will return undefined
     */
    async getNonce(
        nonceRequestType: OrderNonce = OrderNonce.Auto
    ): Promise<string | undefined> {
        if (nonceRequestType === OrderNonce.Empty) {
            return
        }

        const encodedNonce = encodeNonce(
            this.limitOrderV3Contract,
            this.makerAddress
        )

        const nonceHex = await this.provider.ethCall(
            this.makerAddress,
            encodedNonce
        )

        return decodeNonce(nonceHex)
    }
}
