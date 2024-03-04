# Utils library for 1inch Fusion Mode

## Installation

### Npm

```
npm install @1inch/fusion-sdk
```

### Yarn

```
yarn add @1inch/fusion-sdk
```

## Modules docs

-   [auction-calculator](src/auction-calculator/README.md)
-   [auction-salt](src/fusion-order/auction-details/README.md)
-   [auction-suffix](src/fusion-order/settlement-post-interaction-data/README.md)
-   [fusion-order](src/fusion-order/README.md)
-   [sdk](src/sdk/README.md)
-   [ws-api](src/ws-api/README.md)

## How to swap with Fusion Mode

```typescript
const makerPrivateKey = '0x123....'
const makerAddress = '0x123....'

const nodeUrl = '....'

const blockchainProvider = new PrivateKeyProviderConnector(
    makerPrivateKey,
    new Web3(nodeUrl)
)

const sdk = new FusionSDK({
    url: 'https://api.1inch.dev/fusion',
    network: 1,
    blockchainProvider,
    authKey: 'your-auth-key'
})

sdk.placeOrder({
    fromTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    toTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    amount: '50000000000000000', // 0.05 ETH
    walletAddress: makerAddress
}).then(console.log)
```

## Resolvers

`settleOrders` function usage and Resolver contract examples you can find [here](https://github.com/1inch/fusion-resolver-example)

## Other language implementations

| Language | Link                                                                  | Type             |
| -------- | --------------------------------------------------------------------- | ---------------- |
| rust     | [frolovdev/fusion-sdk-rs](https://github.com/frolovdev/fusion-sdk-rs) | Community driven |
