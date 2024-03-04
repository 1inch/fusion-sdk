## AuctionDetails

**Description:** encapsulates:

-   auction start time
-   duration of an auction
-   initial rate bump
-   auction price curve

**Examples:**

```typescript
import {AuctionDetails} from '@1inch/fusion-sdk'

const details = new AuctionDetails({
    duration: 180, // in seconds,
    auctionStartTime: 1673548149n, // unix timestamp (in sec),
    initialRateBump: 50000, // difference between max and min amount in percents, 10000000 = 100%
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
    ]
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
