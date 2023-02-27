import {BigNumber} from '@ethersproject/bignumber'
import {GasPrice} from '../../api/gas-price/gas-price'

export type TransactionParams = {
    to: string
    data: string
    value: BigNumber | string
    gasPrice: GasPrice
    gasPriceMultiplier?: number
    nonce?: number
    gasLimit?: number
    from?: string
    network?: number
}
