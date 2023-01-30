import {NetworkEnum} from '../constants'
import {HttpProviderConnector} from '../connector'

export type FusionApiConfig = {
    url: string
    network: NetworkEnum
    httpProvider?: HttpProviderConnector
}
