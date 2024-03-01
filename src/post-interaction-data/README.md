## PostInteractionData

Contains data for whitelist validation and fee charging

**Examples:**

```typescript
type AuctionWhitelistItem = {
    /**
     * Address which can perform resolving
     */
    address: Address
    /**
     * Delay relative to previous allowed time (auctionStartTime for 1st item), when address can start resolving. In seconds
     */
    allowance: number
}

type SettlementSuffixData = {
    whitelist: AuctionWhitelistItem[]
    /**
     * fee to charge from taker in takerAsset
     */
    integratorFee: {
        /**
         * 10000000 = 1%
         */
        ratio: bigint
        receiver: Address
    }
    /**
     * Fee charged from resolver in favor of DAO
     */
    bankFee: bigint
}
```

**Example:**

```typescript
import {PostInteractionData} from '@1inch/fusion-sdk'

const data = PostInteractionData.new({
    bankFee: 0n,
    auctionStartTime: 1708117482n,
    whitelist: [
        {
            address: new Address('0x111111111117dc0aa78b770fa6a738034120c302'),
            allowance: 0
        }
    ],
    integratorFee: {
        receiver: new Address('0x111111111117dc0aa78b770fa6a738034120c302'),
        ratio: bpsToRatioFormat(10)
    }
})

data.encode()
// #=> '0x020000000000000000000000000000000000000000000f424065cfcdea000000000000000000000000'
```

### static PostInteractionData.decode

**Arguments:** interactions: string

**Example:**

```typescript
import {PostInteractionData} from '@1inch/fusion-sdk'

const encodedData =
    '0x020000000000000000000000000000000000000000000f424065cfcdea000000000000000000000000'

const data = PostInteractionData.decode(encodedData)
```
