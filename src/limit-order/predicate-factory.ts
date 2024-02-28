import {add0x, toBN} from '../utils'
import {BN} from '../utils/bytes/bn'

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
        const timeHex = BN.fromNumber(deadline).toHex(64).slice(2)

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
            .or(toBN(nonce).shiftLeft(160n))
            .or(toBN(deadline).shiftLeft(208n))
            .toHex(64)
            .slice(2)

        return (
            add0x(PredicateFactory.TIMESTAMP_BELOW_AND_NONCE_EQUALS_SELECTOR) +
            timeNonceAccountHex
        )
    }

    /**
     * @param predicate predicate field from parsed order's interactions
     * @returns {number} expiration time in seconds in case it exists in predicate
     */
    static parseExpirationTime(predicate: string): number | null {
        if (predicate.includes(PredicateFactory.TIMESTAMP_BELOW_SELECTOR)) {
            const dataAfterSelector = predicate.split(
                PredicateFactory.TIMESTAMP_BELOW_SELECTOR
            )[1]
            const deadlineSec = BigInt(
                '0x' + dataAfterSelector.substring(0, 64)
            ).toString()

            return +deadlineSec
        }

        if (
            predicate.includes(
                PredicateFactory.TIMESTAMP_BELOW_AND_NONCE_EQUALS_SELECTOR
            )
        ) {
            const dataAfterSelector = predicate.split(
                PredicateFactory.TIMESTAMP_BELOW_AND_NONCE_EQUALS_SELECTOR
            )[1]
            const funcData = '0x' + dataAfterSelector.substring(0, 64)
            const info = toBN(funcData)

            return info.shiftRight(160n + (208n - 160n)).toNumber()
        }

        return null
    }
}
