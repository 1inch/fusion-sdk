## FusionOrder

**Example:**

```typescript
import {AuctionDetails, FusionOrder} from '@1inch/fusion-sdk'

const extensionContract = new Address(
    '0x8273f37417da37c4a6c3995e82cf442f87a25d9c'
)
const order = FusionOrder.new(
    extensionContract,
    {
        makerAsset: new Address(
            '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
        ),
        takerAsset: new Address(
            '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
        ),
        makingAmount: 1000000000000000000n,
        takingAmount: 1420000000n,
        maker: new Address(
            '0x00000000219ab540356cbb839cbe05303d7705fa'
        ),
        salt: 10n
    },
    {
        auction: new AuctionDetails({
            duration: 180n,
            startTime: 1673548149n,
            initialRateBump: 50000,
            points: [
                {
                    coefficient: 20000,
                    delay: 12
                }
            ]
        }),
        whitelist: [
            {
                address: new Address(
                    '0x00000000219ab540356cbb839cbe05303d7705fa'
                ),
                delay: 0n
            }
        ]
    },
)

const builtOrder = order.build()
/* #=> {
            maker: '0x00000000219ab540356cbb839cbe05303d7705fa',
            makerAsset: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
            makingAmount: '1000000000000000000',
            receiver: '0x0000000000000000000000000000000000000000',
            takerAsset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
            takingAmount: '1420000000',
            makerTraits:
                '29852648006495581632639394572552351243421169944806257724550573036760110989312',
            salt: '14832508939800728556409473652845244531014097925085'
        }
*/
```
