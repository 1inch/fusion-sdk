## AuctionSalt

**Description:** encapsulates:

-   auction start time
-   duration of an auction
-   initial rate bump
-   taker fee
-   salt (optional parameter to control entropy)

**Examples:**

```typescript
import {AuctionSalt} from '@1inch/fusion-sdk'

const salt = new AuctionSalt({
    duration: 180 // in seconds,
    auctionStartTime: 1673548149 // unix timestamp,
    initialRateBump: 50000 // difference between max and min amount in percents, 10000000 = 100%
    bankFee: '0' // in wei
})

salt.build()
// #=> '45118768841948961586167738353692277076075522015101619148498725069326976549864'
```

Or you can pass optional parameter in constructor to control entropy (be default we use randomInt 10000)

```typescript
import {AuctionSalt} from '@1inch/fusion-sdk'

// your random generated string
const saltString = myCustomRandFunction()

const salt = new AuctionSalt({
    duration: 180 // in seconds,
    auctionStartTime: 1673548149 // unix timestamp,
    initialRateBump: 50000 // 10000000 = 100%
    bankFee: '0' // in wei,
    salt: saltString
})

salt.build()
```

### static AuctionSalt.decode

**Description:** creates AuctionSalt instance from string
**Arguments:** string

```typescript
import {AuctionSalt} from '@1inch/fusion-sdk'

const salt = AuctionSalt.decode('45118768841948961586167738353692277076075522015101619148498725069326976549864')
// #=> AuctionSalt
```