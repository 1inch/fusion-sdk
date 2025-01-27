# SDK for 1inch Fusion Mode

## Installation

### Npm

```
npm install @1inch/fusion-sdk@2
```

### Yarn

```
yarn add @1inch/fusion-sdk@2
```

## Modules docs

-   [auction-calculator](src/auction-calculator/README.md)
-   [auction-details](src/fusion-order/auction-details/README.md)
-   [settlement-post-interaction-data](src/fusion-order/settlement-post-interaction-data/README.md)
-   [fusion-order](src/fusion-order/README.md)
-   [sdk](src/sdk/README.md)
-   [ws-api](src/ws-api/README.md)

## How to swap with Fusion Mode

```typescript
import {FusionSDK, NetworkEnum, OrderStatus, PrivateKeyProviderConnector, Web3Like,} from "@1inch/fusion-sdk";
import {computeAddress, formatUnits, JsonRpcProvider} from "ethers";

const PRIVATE_KEY = 'YOUR_PRIVATE_KEY'
const NODE_URL = 'YOUR_WEB3_NODE_URL'
const DEV_PORTAL_API_TOKEN = 'YOUR_DEV_PORTAL_API_TOKEN'

const ethersRpcProvider = new JsonRpcProvider(NODE_URL)

const ethersProviderConnector: Web3Like = {
    eth: {
        call(transactionConfig): Promise<string> {
            return ethersRpcProvider.call(transactionConfig)
        }
    },
    extend(): void {}
}

const connector = new PrivateKeyProviderConnector(
    PRIVATE_KEY,
    ethersProviderConnector
)

const sdk = new FusionSDK({
    url: 'https://api.1inch.dev/fusion',
    network: NetworkEnum.BINANCE,
    blockchainProvider: connector,
    authKey: DEV_PORTAL_API_TOKEN
})

async function main() {
    const params = {
        fromTokenAddress: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
        toTokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',  // BNB
        amount: '10000000000000000000', // 10 USDC
        walletAddress: computeAddress(PRIVATE_KEY),
        source: 'sdk-test'
    }

    const quote = await sdk.getQuote(params)

    const dstTokenDecimals = 18
    console.log('Auction start amount', formatUnits(quote.presets[quote.recommendedPreset].auctionStartAmount, dstTokenDecimals))
    console.log('Auction end amount', formatUnits(quote.presets[quote.recommendedPreset].auctionEndAmount), dstTokenDecimals)

    const preparedOrder = await sdk.createOrder(params)

    const info = await sdk.submitOrder(preparedOrder.order, preparedOrder.quoteId)

    console.log('OrderHash', info.orderHash)

    const start = Date.now()

    while (true) {
        try {
            const data = await sdk.getOrderStatus(info.orderHash)

            if (data.status === OrderStatus.Filled) {
                console.log('fills', data.fills)
                break
            }

            if (data.status === OrderStatus.Expired) {
                console.log('Order Expired')
                break
            }
            
            if (data.status === OrderStatus.Cancelled) {
                console.log('Order Cancelled')
                break
            }
        } catch (e) {
            console.log(e)
        }

    }

    console.log('Order executed for', (Date.now() - start) / 1000, 'sec')
}

main()
```

## Resolvers

`settleOrders` function usage and Resolver contract examples you can find [here](https://github.com/1inch/fusion-resolver-example)
