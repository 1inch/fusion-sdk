# Whitelist

Contains addresses and time from which they can resolver order

## Examples 


### Encode/decode whitelist struct
```typescript
import {Whitelist, now} from '@1inch/fusion-sdk'

const resolvingStartTime = now()
const whitelist = Whitelist.new(
    resolvingStartTime,
    [
        {
            address: new Address('0x111111111117dc0aa78b770fa6a738034120c302'),
            allowFrom: resolvingStartTime
        },
        {
            address: new Address('0x222222222227dc0aa78b770fa6a738034120c302'),
            allowFrom: resolvingStartTime + 10n
        }
    ],
)

const encoded = data.encode() // => '0x...'

const whitelist2 = Whitelist.decode(encoded) // => same as `whitelist`
```

### Check exclusivity
```typescript
import {Whitelist, now} from '@1inch/fusion-sdk'

const resolvingStartTime = now()
const whitelist = Whitelist.new(
    resolvingStartTime,
    [
        {
            address: new Address('0x111111111117dc0aa78b770fa6a738034120c302'),
            allowFrom: resolvingStartTime
        },
        {
            address: new Address('0x222222222227dc0aa78b770fa6a738034120c302'),
            allowFrom: resolvingStartTime + 10n
        }
    ]
)

const isExclusive = whitelist.isExclusiveResolver(new Address('0x111111111117dc0aa78b770fa6a738034120c302')) // true
const isExclusivityPeriod = whitelist.isExclusivityPeriod(resolvingStartTime + 5n) // true
const canExecuteAt = whitelist.canExecuteAt(new Address('0x222222222227dc0aa78b770fa6a738034120c302'), resolvingStartTime) // false
```
