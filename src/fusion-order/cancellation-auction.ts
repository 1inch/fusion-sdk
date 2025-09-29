import {UINT_32_MAX, UINT_16_MAX} from '@1inch/byte-utils'
import assert from 'assert'

export class CancellationAuction {
    static ZERO = new CancellationAuction(0n, 0n)

    constructor(
        public readonly duration: bigint,
        /**
         * Value in bps, i.e. 5000 for 50%
         *
         * Maximum reward (as percentage of gas cost) that resolver receives for cancelling an expired order.
         * The reward is deducted from the order's making amount.
         * To make order cancellation attractive to resolver max reward should be >= 100%
         *
         * @example Order: 1 ETH, Cancellation gas: 0.00001 ETH, Reward: 50%
         * → Resolver gets: 0.000005 ETH (50% of gas cost)
         * → User gets back: 0.999995 ETH
         */
        public readonly maxRewardBps: bigint
    ) {
        assert(
            duration <= UINT_32_MAX,
            'max cancellation auction duration must be <= UINT_32_MAX'
        )

        assert(
            maxRewardBps <= UINT_16_MAX,
            'max cancellation auction maxRewardBps must be <= UINT_16_MAX'
        )
    }

    public build(): bigint {
        return (this.duration << 16n) | this.maxRewardBps
    }
}
