## AuctionDetails

**Description:** encapsulates:

-   auction start time
-   duration of an auction
-   initial rate bump
-   auction price curve
-   gas cost

**Examples:**

```typescript
import {AuctionDetails} from '@1inch/fusion-sdk'

const details = new AuctionDetails({
    duration: 180n, // in seconds,
    startTime: 1673548149n, // unix timestamp (in sec),
    /**
     * It defined as a ratio of startTakingAmount to endTakingAmount. 10_000_000 means 100%
     *
     * @see `AuctionCalculator.calcInitialRateBump`
     */
    initialRateBump: 50000,
    /**
     * Points which define price curve.
     * Each point contains `delay` - relative to previous point (auction start for first)
     * and `coefficient` - rate bump for `auctionEndAmount` (10000000 = 100%)
     *
     * y(rate) ▲
     *         │
     *    5000 │\
     *         │ \
     *         │  \
     *    4000 │   \───────
     *         │           \
     *         │            \
     *    3000 │             \
     *         │              \
     *         └─────────────────────────►
     *         0   10     20  end   x(time)
     */
    points: [
        {
            delay: 10, // relative to auction start time
            coefficient: 40000
        },

        {
            delay: 10, // relative to previous point
            coefficient: 40000
        }
    ],
    /**
     * Allows to ajust estimated gas costs to real onchain gas costs
     */
    gasCost: {
        /**
         * Rate bump to cover gas price. 
         * It defined as a ratio of gasCostInToToken to endTakingAmount. 10_000_000 means 100%
         * 
         * @see `AuctionCalculator.calcGasBumpEstimate`
         */
        gasBumpEstimate: 10_000n,
        /**
         * Gas price at estimation time. 1000 means 1 Gwei
         */
        gasPriceEstimate: 1000n
    }
})

details.encode()
// #=> '0x63c051750000b400c350009c40000a009c40000a'
```

### static AuctionDetails.decode

**Arguments:** string

```typescript
import {AuctionDetails} from '@1inch/fusion-sdk'

const salt = AuctionDetails.decode('0x63c051750000b400c350009c40000a009c40000a')
// #=> AuctionDetails
```
