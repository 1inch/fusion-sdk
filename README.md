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

-   [auction-calculator](src/auction-calculator/readme.md)
-   [auction-salt](src/auction-salt/readme.md)
-   [auction-suffix](src/auction-suffix/readme.md)
-   [fusion-order](src/fusion-order/readme.md)
-   [sdk](src/sdk/readme.md)

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
    url: 'https://fusion.1inch.io',
    network: 1,
    blockchainProvider
})

sdk.placeOrder({
    fromTokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    toTokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    amount: '50000000000000000', // 0.05 ETH
    walletAddress: makerAddress
}).then(console.log)
```
