import {BigNumber} from '@ethersproject/bignumber'
import {add0x, toBN} from '../utils'

export class PredicateFactory {
    /**
     * timestampBelow(uint256)
     */
    private static TIMESTAMP_BELOW_SELECTOR = '63592c2b'

    /**
     * timestampBelowAndNonceEquals(uint256 timeNonceAccount)
     */
    private static TIMESTAMP_BELOW_AND_NONCE_EQUALS_SELECTOR = '2cc2878d'

    /**
     * @param deadline timestamp in seconds (order expiration time)
     */
    static timestampBelow(deadline: number): string {
        const timeHex = BigNumber.from(deadline)
            .toHexString()
            .substring(2)
            .padStart(64, '0')

        return add0x(PredicateFactory.TIMESTAMP_BELOW_SELECTOR) + timeHex
    }

    /**
     * @param address limit order creator address
     * @param nonce sequence number for order cancellation
     * @param deadline timestamp in seconds (order expiration time)
     */
    static timestampBelowAndNonceEquals(
        address: string,
        nonce: string | number,
        deadline: number
    ): string {
        const timeNonceAccountHex = toBN(address)
            .or(toBN(nonce).shln(160))
            .or(toBN(deadline).shln(208))
            .toString('hex')
            .padStart(64, '0')

        return (
            add0x(PredicateFactory.TIMESTAMP_BELOW_AND_NONCE_EQUALS_SELECTOR) +
            timeNonceAccountHex
        )
    }
}
