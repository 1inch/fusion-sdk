import {StartedTestContainer} from 'testcontainers'
import {TestWallet} from './test-wallet'

/* eslint-disable no-var */

declare global {
    var localNode: StartedTestContainer
    var localNodeProvider: JsonRpcProvider
    var maker: TestWallet
    var taker: TestWallet
    var settlementExtension: string
}
