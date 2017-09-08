# TCP Emitter NodeJS Client

`TCP Emitter Client` is an [EventEmitter](https://nodejs.org/api/events.html) that can connect with a [TCP Emitter Server](https://github.com/tcp-emitter/server) to interact with other connected clients.

# Installation

```bash
npm install --save tcp-emitter-client
```

# API

## require('tcp-emitter-client')(options)

Options                | Type       | Default      | Description
---------------------- | ---------- | ------------ | -----------
`options.delimiter`    | `string`   | '@@@'        | Delimiter used to seperate payloads in a single TCP request. [More info here](https://github.com/tcp-emitter/server#delimiter).

## client.socket

[net.Socket](https://nodejs.org/api/net.html#net_class_net_socket) object used to connect the `TCP Emitter client` with the `TCP Emitter server`.

## client.connect(..)

Function used to connect the `TCP Emitter client` with a `TCP Emitter server`.

> Alias to [client.socket.connect](https://nodejs.org/api/net.html#net_socket_connect_port_host_connectlistener).

## client.end(..)

Function used to disconnect the `TCP Emitter client` from the `TCP Emitter server`.

> Alias to [client.socket.end](https://nodejs.org/api/net.html#net_socket_end_data_encoding).

# TCP Emitter Requests

When a `TCP Emitter client` is connected to a `TCP Emitter server`, apart from functioning as a normal [EventEmitter](https://nodejs.org/api/events.html), it will need to interact with the `TCP Emitter server` it is connected to through TCP requests. The following section describes when this client sends each type of request.

## Subscribe Request

- When the `TCP Emitter client` connects with a `TCP Emitter server` it will subscribe to all the events it has registered listeners.
- When the `TCP Emitter client` is connected to a `TCP Emitter server` and a first listener is added to an event.

## Unsubscribe Request

- When the `TCP Emitter client` is connected to a `TCP Emitter server` and a last listener is removed from an event.

## Broadcast Request

- When the `TCP Emitter client` is connected to a `TCP Emitter server` and an event is emitted.

# Example

```javascript
// Create a new TCP Emitter client.
const clientInst = require('tcp-emitter-client')()

// Function to serve as a listener for this example.
const listener = (name) => console.log(`Hello ${name}`)

// When adding a listener to an event before connecting to a TCP Emitter server,
// TCP Emitter client will function as a normal EventEmitter and thus refrain
// from sending a TCP Emitter subscribe request.
clientInst.on('new-user', listener)

// When connecting to a TCP Emitter server, TCP Emitter client will subscribe to
// all the events it currently has registered. By doing this its listeners will
// be invoked when a connected client emits the same events.
clientInst.connect(8080)

// When adding the first listener to an event in TCP Emitter client after
// connecting to a TCP Emitter server, TCP Emitter client will automatically
// send a TCP Emitter Subscribe request to the TCP Emitter server it is
// connected to. By doing this the listener & future listeners of the event will
// be invoked whenever a connected client emits the same event.
clientInst.on('remove-user', listener)

// When removing the last listener from a TCP Emitter client after connecting to
// a TCP Emitter server, TCP Emitter client will automatically send a TCP
// Emitter Unsubscribe request to the TCP Emitter server it is connected to.
clientInst.removeListener('remove-user', listener)

// When emitting an event after connecting the TCP Emitter client to a TCP
// Emitter server, TCP Emitter client will automatically send a TCP Emitter
// Broadcast request to the TCP Emitter server it is connected to. By doing this
// it will invoke the listeners of the event emitted of all the other connected
// clients.
clientInst.emit('new-user', [1, '2', true, { name: 'luca' }])
```

# Tests
```
npm install
npm test
```

# Generate Documentation
```
npm install
npm run docs
```

# License
ISC
