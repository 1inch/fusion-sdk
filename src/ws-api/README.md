# Websocket Api

**Description:** provides high level functionality to working with fusion mode

## Real world example

```typescript
import {WebSocketApi, NetworkEnum} from '@1inch/fusion-sdk'

async function main() {
    const ws = new WebSocketApi({
        url: 'wss://fusion.1inch.io/ws',
        network: NetworkEnum.ETHEREUM
    })

    wsSdk.order.onOrder((data) => {
        console.log('received order event', data)
    })
}

main()
```

## Creation

**With constructor:**

```typescript
import {WebSocketApi, NetworkEnum} from '@1inch/fusion-sdk'

const ws = new WebSocketApi({
    url: 'wss://fusion.1inch.io/ws',
    network: NetworkEnum.ETHEREUM
})
```

**Custom provider:**

User can provide custom provider for websocket (be default we are using [ws library](https://www.npmjs.com/package/ws))

```typescript
import {WsProviderConnector, WebSocketApi} from '@1inch/fusion-sdk'

class MyFancyProvider implements WsProviderConnector {
    // ... user implementation
}

const url = 'wss://fusion.1inch.io/ws'
const provider = new MyFancyProvider({url})

const wsSdk = new WebSocketApi(provider)
```

**With new static method:**

```typescript
import {WebSocketApi, NetworkEnum} from '@1inch/fusion-sdk'

const ws = WebSocketApi.new({
    url: 'wss://fusion.1inch.io/ws',
    network: NetworkEnum.ETHEREUM
})
```

**Lazy initialization:**

By default when user creates an instance of WebSocketApi, it automatically opens websocket connection which might be a problem for some use cases

```typescript
import {WebSocketApi, NetworkEnum} from '@1inch/fusion-sdk'

const ws = new WebSocketApi({
    url: 'wss://fusion.1inch.io/ws',
    network: NetworkEnum.ETHEREUM,
    lazyInit: true
})

ws.init()
```

