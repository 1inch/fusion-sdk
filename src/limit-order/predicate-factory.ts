import {BigNumber} from '@ethersproject/bignumber'

export class PredicateFactory {
    /**
     * timestampBelow(uint256)
     */
    private static TIMESTAMP_BELOW_SELECTOR = '0x63592c2b'

    /**
     * @param deadline timestamp in seconds
     */
    static timestampBelow(deadline: number): string {
        const timeHex = BigNumber.from(deadline)
            .toHexString()
            .substring(2)
            .padStart(64, '0')

        return PredicateFactory.TIMESTAMP_BELOW_SELECTOR + timeHex
    }
}
