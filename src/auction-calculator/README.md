## AuctionCalculator

**Description:** used to calculate taker amount and auction rate

### Real world example

```typescript
import {
    AuctionCalculator,
    SettlementPostInteractionData,
    AuctionDetails,
    Address,
    bpsToRatioFormat
} from '@1inch/fusion-sdk'

const startTime = 1673548149n
const settlementData = SettlementPostInteractionData.new({
    bankFee: 0n,
    auctionStartTime: startTime,
    whitelist: [
        {
            address: new Address('0x111111111117dc0aa78b770fa6a738034120c302'),
            delay: 0n
        }
    ],
    integratorFee: {
        receiver: new Address('0x111111111117dc0aa78b770fa6a738034120c302'),
        ratio: bpsToRatioFormat(10)
    }
})
const details = new AuctionDetails({
    duration: 180n, // in seconds,
    startTime, // unix timestamp (in sec),
    initialRateBump: 50000,
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
const calculator = AuctionCalculator.fromAuctionData(settlementData, details) // #=> AuctionCalculator instance

const rate = calculator.calcRateBump(startTime + 11n)
// #=> 40000

const auctionTakingAmount = calculator.calcAuctionTakingAmount(
    1420000000n,
    rate
)
// #=> 1427105680
```


