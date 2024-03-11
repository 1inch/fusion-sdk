import {OrderEventType} from './types'

export const orderEvents: OrderEventType['event'][] = [
    'order_created',
    'order_invalid',
    'order_balance_or_allowance_change',
    'order_filled',
    'order_filled_partially',
    'order_cancelled'
]
