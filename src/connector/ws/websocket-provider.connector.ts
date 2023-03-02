import {AnyFunctionWithThis, AnyFunction, OnMessageCb} from './types'

export interface WsProviderConnector {
    init(): void

    on(event: string, cb: AnyFunctionWithThis): void
    off(event: string, cb: AnyFunctionWithThis): void

    onOpen(cb: AnyFunctionWithThis): void

    send<T>(message: T): void
    close(): void

    onMessage(cb: OnMessageCb): void
    onClose(cb: AnyFunction): void
    onError(cb: AnyFunction): void
}
