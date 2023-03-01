import {GasPrice} from '../../api/gas-price'

export type TransactionParams = {
    to: string
    data: string
    value: string
    gasPrice: GasPrice
    gasPriceMultiplier?: number
    nonce?: number
    gasLimit?: number
    from?: string
    network?: number
}
