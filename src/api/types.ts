import {NetworkEnum} from '../constants'
import {HttpProviderConnector} from '../connector'

export type FusionApiConfig = {
    url: string
    network: NetworkEnum
    httpProvider?: HttpProviderConnector
    wsLazyInit?: boolean
}

export type PaginationMeta = {
    totalItems: number
    itemsPerPage: number
    totalPages: number
    currentPage: number
}

export type PaginationOutput<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    T extends Record<string, any> = Record<string, any>
> = {
    meta: PaginationMeta
    items: T[]
}
