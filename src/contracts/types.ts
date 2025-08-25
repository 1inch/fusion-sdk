import {Address} from '@1inch/limit-order-sdk'

export type CallInfo = {
    data: string
    to: Address
    value: bigint
}
