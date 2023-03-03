# Websocket Api

**Description:** provides high level functionality to working with fusion mode

## Real world example

```typescript
import {WebSocketApi, NetworkEnum} from '@1inch/fusion-sdk'

const ws = new WebSocketApi({
    url: 'wss://fusion.1inch.io/ws',
    network: NetworkEnum.ETHEREUM
})

wsSdk.order.onOrder((data) => {
    console.log('received order event', data)
})
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

## Methods

**Base methods**

### on

**Description**: You can subscribe to any event

**Arguments**:

-   [0] event: string
-   [1] cb: Function

**Example:**

```typescript
import {WebSocketApi, NetworkEnum} from '@1inch/fusion-sdk'

const ws = new WebSocketApi({
    url: 'wss://fusion.1inch.io/ws',
    network: NetworkEnum.ETHEREUM
})

ws.on('error', console.error)

ws.on('open', function open() {
    ws.send('something')
})

ws.on('message', function message(data) {
    console.log('received: %s', data)
})
```

### off

**Description**: You can unsubscribe from any event

**Arguments**:

-   [0] event: string
-   [1] си: Function

**Example:**

```typescript
import {WebSocketApi, NetworkEnum} from '@1inch/fusion-sdk'

const ws = new WebSocketApi({
    url: 'wss://fusion.1inch.io/ws',
    network: NetworkEnum.ETHEREUM
})

ws.on('error', console.error)

ws.on('open', function open() {
    ws.send('something')
})

function message(data) {
    console.log('received: %s', data)
}

ws.on('message', message)

ws.off('message', message)
```

### onOpen

**Example:**

```typescript
import {WebSocketApi, NetworkEnum} from '@1inch/fusion-sdk'

const ws = new WebSocketApi({
    url: 'wss://fusion.1inch.io/ws',
    network: NetworkEnum.ETHEREUM
})

ws.onOpen(() => {
    console.log('connection is opened')
})
```

### send

**Example:**

```typescript
import {WebSocketApi, NetworkEnum} from '@1inch/fusion-sdk'

const ws = new WebSocketApi({
    url: 'wss://fusion.1inch.io/ws',
    network: NetworkEnum.ETHEREUM
})

ws.send('my message')
```

### close

Closes connection

**Example:**

```typescript
import {WebSocketApi, NetworkEnum} from '@1inch/fusion-sdk'

const ws = new WebSocketApi({
    url: 'wss://fusion.1inch.io/ws',
    network: NetworkEnum.ETHEREUM
})

ws.close()
```

### onMessage

**Example:**

```typescript
import {WebSocketApi, NetworkEnum} from '@1inch/fusion-sdk'

const ws = new WebSocketApi({
    url: 'wss://fusion.1inch.io/ws',
    network: NetworkEnum.ETHEREUM
})

ws.onMessage((data) => {
    console.log('message received', data)
})
```

### onClose

**Example:**

```typescript
import {WebSocketApi, NetworkEnum} from '@1inch/fusion-sdk'

const ws = new WebSocketApi({
    url: 'wss://fusion.1inch.io/ws',
    network: NetworkEnum.ETHEREUM
})

ws.onClose(() => {
    console.log('connection is closed')
})
```

### onError

**Example:**

```typescript
import {WebSocketApi, NetworkEnum} from '@1inch/fusion-sdk'

const ws = new WebSocketApi({
    url: 'wss://fusion.1inch.io/ws',
    network: NetworkEnum.ETHEREUM
})

ws.onError((error) => {
    console.log('error is received', error)
})
```

**Order namespace**

### onOrder

**Example:**

```typescript
import {WebSocketApi, NetworkEnum} from '@1inch/fusion-sdk'

const ws = new WebSocketApi({
    url: 'wss://fusion.1inch.io/ws',
    network: NetworkEnum.ETHEREUM
})

ws.order.onOrder((error) => {
    console.log('error is received', error)
})
```

### onOrderCreated

### onOrderInvalid

### onOrderBalanceOrAllowanceChange

### onOrderFilled

### onOrderFilledPartially

**Rpc namespace**

### onPong

### ping

### getAllowedMethods

### onGetAllowedMethods
