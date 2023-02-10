## AuctionSuffix

**Arguments:** suffix: SettlementSuffixData

```typescript
type AuctionPoint = {
    delay: number
    coefficient: number
}

type AuctionWhitelistItem = {
    address: string
    allowance: number // seconds
}

type SettlementSuffixData = {
    points: AuctionPoint[] // represents auction points with rates and delays
    whitelist: AuctionWhitelistItem[] // combination of the resolver address and allowance in seconds, which represents how long the order can be full filled by the address
    publicResolvingDeadline?: number // represents deadline in seconds
    takerFeeReceiver?: string // address of the receiver
    takerFeeRatio?: string // taker ratio, 10000000 = 1%
}
```

Example:

```typescript
const suffix = new AuctionSuffix({
    points: [
        {
            coefficient: 20000,
            delay: 12
        }
    ],
    whitelist: [
        {
            address: '0x00000000219ab540356cbb839cbe05303d7705fa',
            allowance: 0
        }
    ]
})

suffix.build()
// #=> '000c004e200000000000000000219ab540356cbb839cbe05303d7705faf486570009'
```

### static AuctionSuffix.decode

**Arguments:** interactions: string

**Example:**

```typescript
const encodedSuffix =
    '000c004e200000000000000000219ab540356cbb839cbe05303d7705fa63c0566a09'

const suffix = AuctionSuffix.decode(encodedSuffix)

suffix.build()
// #=> '000c004e200000000000000000219ab540356cbb839cbe05303d7705fa63c0566a09'
```
