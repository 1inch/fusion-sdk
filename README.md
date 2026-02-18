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

- [auction-details](src/fusion-order/auction-details/README.md)
- [fusion-order](src/fusion-order/README.md)
- [sdk](src/sdk/README.md)
- [ws-api](src/ws-api/README.md)

## How to swap with Fusion Mode

```typescript
import {
    FusionSDK,
    NetworkEnum,
    OrderStatus,
    PrivateKeyProviderConnector,
    Web3Like
} from '@1inch/fusion-sdk'
import {computeAddress, formatUnits, JsonRpcProvider} from 'ethers'

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
    url: 'https://api.1inch.com/fusion',
    network: NetworkEnum.BINANCE,
    blockchainProvider: connector,
    authKey: DEV_PORTAL_API_TOKEN
})

async function main() {
    const params = {
        fromTokenAddress: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
        toTokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // BNB
        amount: '10000000000000000000', // 10 USDC
        walletAddress: computeAddress(PRIVATE_KEY),
        source: 'sdk-test'
    }

    const quote = await sdk.getQuote(params)

    const dstTokenDecimals = 18
    console.log(
        'Auction start amount',
        formatUnits(
            quote.presets[quote.recommendedPreset].auctionStartAmount,
            dstTokenDecimals
        )
    )
    console.log(
        'Auction end amount',
        formatUnits(quote.presets[quote.recommendedPreset].auctionEndAmount),
        dstTokenDecimals
    )

    const preparedOrder = await sdk.createOrder(params)

    const info = await sdk.submitOrder(
        preparedOrder.order,
        preparedOrder.quoteId
    )

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

## How to swap with Fusion mode from Native asset

```typescript
import {
    FusionSDK,
    NetworkEnum,
    OrderStatus,
    PrivateKeyProviderConnector,
    Web3Like,
    Address,
    NativeOrdersFactory
} from '@1inch/fusion-sdk'
import {computeAddress, formatUnits, JsonRpcProvider, Wallet} from 'ethers'

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
    url: 'https://api.1inch.com/fusion',
    network: NetworkEnum.BINANCE,
    blockchainProvider: connector,
    authKey: DEV_PORTAL_API_TOKEN
})

const wallet = new Wallet(PRIVATE_KEY, ethersRpcProvider)

async function main() {
    const params = {
        fromTokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee', // ETH
        toTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        amount: '2000000000000000', // 0.002 ETH
        walletAddress: computeAddress(PRIVATE_KEY),
        source: 'sdk-test'
    }

    const quote = await sdk.getQuote(params)

    const dstTokenDecimals = 6
    console.log(
        'Auction start amount',
        formatUnits(
            quote.presets[quote.recommendedPreset].auctionStartAmount,
            dstTokenDecimals
        )
    )
    console.log(
        'Auction end amount',
        formatUnits(quote.presets[quote.recommendedPreset].auctionEndAmount),
        dstTokenDecimals
    )

    const preparedOrder = await sdk.createOrder(params)

    const info = await sdk.submitNativeOrder(
        preparedOrder.order,
        new Address(params.walletAddress),
        preparedOrder.quoteId
    )

    console.log('OrderHash', info.orderHash)

    const factory = NativeOrdersFactory.default(NetworkEnum.BINANCE)
    const call = factory.create(
        new Address(wallet.address),
        preparedOrder.order.build()
    )

    const txRes = await wallet.sendTransaction({
        to: call.to.toString(),
        data: call.data,
        value: call.value
    })

    console.log('TxHash', txRes.hash)

    await wallet.provider.waitForTransaction(txRes.hash)

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

## How to swap with Fusion Mode using TransferPermit

Instead of granting a token approval to the 1inch Limit Order Protocol, you can use a `TransferPermit` for signature-based transfers via a Permit2Proxy contract.

The maker only needs to approve tokens to the Permit2 contract once. Each order then carries a single-use `PermitTransferFrom` signature instead of an on-chain allowance to the protocol.

```typescript
import {
    FusionSDK,
    NetworkEnum,
    OrderStatus,
    PrivateKeyProviderConnector,
    Web3Like,
    getPermit2Address
} from '@1inch/fusion-sdk'
import {computeAddress, JsonRpcProvider, Wallet} from 'ethers'

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
    url: 'https://api.1inch.com/fusion',
    network: NetworkEnum.ETHEREUM,
    blockchainProvider: connector,
    authKey: DEV_PORTAL_API_TOKEN
})

const wallet = new Wallet(PRIVATE_KEY, ethersRpcProvider)

async function main() {
    // Step 1: Approve token to the Permit2 contract (one-time, can be unlimited)
    // This replaces the usual approval to the 1inch Limit Order Protocol
    const permit2Address = getPermit2Address(NetworkEnum.ETHEREUM)
    // await approveToken(fromTokenAddress, permit2Address, MAX_UINT256)

    // Step 2: Get quote and create order
    const params = {
        fromTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
        toTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        amount: '50000000000000000', // 0.05 WETH
        walletAddress: computeAddress(PRIVATE_KEY)
    }

    const {order, quoteId} = await sdk.createOrder(params)

    // Step 3: Create a transfer permit for the order
    const permit = order.createTransferPermit(NetworkEnum.ETHEREUM)

    // Step 4: Sign the transfer permit
    const permitTypedData = permit.getTypedData(NetworkEnum.ETHEREUM)
    const permitSignature = await connector.signTypedData(
        params.walletAddress,
        permitTypedData
    )

    // Step 5: Attach the signed permit to the order
    const orderWithPermit = order.withTransferPermit(permit, permitSignature)

    // Step 6: Submit the order (the SDK signs the order and sends it to the relayer)
    const info = await sdk.submitOrder(orderWithPermit, quoteId)

    console.log('OrderHash', info.orderHash)

    while (true) {
        const data = await sdk.getOrderStatus(info.orderHash)

        if (data.status === OrderStatus.Filled) {
            console.log('fills', data.fills)
            break
        }

        if (
            data.status === OrderStatus.Expired ||
            data.status === OrderStatus.Cancelled
        ) {
            console.log('Order', data.status)
            break
        }
    }
}

main()
```

**Key differences from a standard swap:**

- Token approval goes to `Permit2` instead of the 1inch protocol
- Create and sign a `PermitTransferFrom` using the Permit2Proxy address as spender
- Call `withTransferPermit` before submitting — this modifies the order to route through the Permit2Proxy

## Resolvers

`settleOrders` function usage and Resolver contract examples you can find [here](https://github.com/1inch/fusion-resolver-example)
