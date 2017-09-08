'use strict'

const net = require('net')
const utils = require('./utils')

/**
 * @module tcp-emitter-client
 * @type {Object}
 */
const tcpEmitterClient = module.exports = {
  /**
   * Socket object that will be used to connect & interact with a TCP Emitter
   * server.
   * @see {@link https://nodejs.org/api/net.html#net_class_net_socket|
   *      net.Socket}
   * @type {net.Socket}
   */
  socket: null,

  /**
   * Delimiter used to seperate payloads in a single TCP request.
   * @see {@link https://github.com/tcp-emitter/server#delimiter|TCP Emitter
   *      Delimiter}
   * @type {string}
   */
  delimiter: null,

  /**
   * Function used to connect with a TCP Emitter server.
   * @see {@link https://nodejs.org/api/net.html#net_socket_connect|
   *      net.Socket connect function}
   * @type {Function}
   */
  connect: null,

  /**
   * Function used to disconnect from a TCP Emitter server.
   * @see {@link https://nodejs.org/api/net.html#net_socket_end_data_encoding|
   *      net.Socket end function}
   * @type {Function}
   */
  end: null,

  /**
   * Function used to initialize the TCP Emitter client.
   * @param  {Object} opts                   Options for init function.
   * @param  {string} [opts.delimiter='@@@'] Delimiter used to seperate payloads
   *                                         in a single TCP request.
   * @see {@link https://github.com/tcp-emitter/server#delimiter|TCP Emitter
   *      Delimiter}
   */
  init (opts = {}) {
    // Setup Socket object to be used to connect with TCP Emitter server.
    this.socket = new net.Socket()

    // Setup delimiter.
    this.delimiter = (typeof opts.delimiter === 'string')
      ? opts.delimiter
      : '@@@'

    // Setup default encoding for message received from TCP Emitter server.
    this.socket.setEncoding('utf-8')

    // Parse any data sent by the TCP Emitter server.
    this.socket.on('data', parsePayload.bind(this))

    // When connecting to a TCP Emitter server, subscribe to all the events for
    // which the TCP Emitter client has registered listeners.
    this.socket.once('connect', syncSubscriptions.bind(this))

    // Setup connect function.
    this.connect = this.socket.connect.bind(this.socket)

    // Setup end function.
    this.end = this.socket.end.bind(this.socket)
  }
}

;[
  'on',
  'once',
  'prependListener',
  'addEventListener',
  'prependOnceListener'
].forEach(fn => {
  /**
   * Override the functions of the EventEmitter used to add new listeners to an
   * event so that when they are invoked checks are made to determine whether to
   * send a TCP Emitter Subscribe request to the TCP Emitter server that the TCP
   * Emitter client is connected to. This function will only attempt to send a
   * TCP Emitter Subscribe request when the listener added to the event is the
   * first listener of the event.
   * @param  {string} event Name of the event that the listener was registered
   *                        to.
   * @param  {...*}   args  Any arguments passed to the function.
   */
  tcpEmitterClient[fn] = function (event, ...args) {
    // Invoke default functionality.
    Object.getPrototypeOf(this)[fn].call(this, event, ...args)

    // Try sending a TCP Emitter Subscribe request only when the listener added
    // to the event is the first listener of the event.
    if (this.listenerCount(event) === 1) subscribe.call(this, event)
  }
})

;[
  'removeListener',
  'removeAllListeners'
].forEach(fn => {
  /**
   * Override the functions of the EventEmitter used to remove listeners from an
   * event so that when they are invoked checks are made to determine whether to
   * send a TCP Emitter Unsubscribe request to the TCP Emitter server that the
   * TCP Emitter client is connected to. This function will only attempt to send
   * a TCP Emitter Unsubscribe request when the listener removed from the event
   * is the last listener of the event.
   * @param  {string} event Name of the event that the listener was unregistered
   *                        from.
   * @param  {...*}   args  Any arguments passed to the function.
   */
  tcpEmitterClient[fn] = function (event, ...args) {
    // Invoke default functionality.
    Object.getPrototypeOf(this)[fn].call(this, event, ...args)

    // Try sending the TCP Emitter Unsubscribe request only when the listener
    // removed from the event is the last listener of the event.
    if (this.listenerCount(event) === 0) unsubscribe.call(this, event)
  }
})

;[
  'emit'
].forEach(fn => {
  /**
   * Override the function of the EventEmitter used to emit an event so that
   * when it is invoked checks are made to determine whether to send a TCP
   * Emitter Broadcast request to the TCP Emitter server that the TCP Emitter
   * client is connected to.
   * @param  {...*} args Any arguments passed to the function.
   */
  tcpEmitterClient[fn] = function (...args) {
    // Invoke default functionality.
    Object.getPrototypeOf(this).emit.call(this, ...args)

    // Send TCP Emitter Broadcast request if needed.
    broadcast.call(this, ...args)
  }
})

/**
 * Functions used to subscribe to all the events for which the TCP Emitter
 * client has registered listeners.
 * @this {module:tcp-emitter-client}
 */
function syncSubscriptions () {
  subscribe.call(this, ...this.eventNames())
}

/**
 * Function used to parse the data received from the TCP Emitter server.
 * @this {module:tcp-emitter-client}
 * @param  {string} data Data received from TCP Emitter server.
 */
function parsePayload (data) {
  // Split the data recieved by the delimiter.
  const payloadsStr = data.split(this.delimiter)

  // Since a TCP Emitter payload is required to end with the specified
  // delimiter, when splitting the data recieved by the TCP Emitter server,
  // the last element in the array will be an empty string, thus we remove it.
  payloadsStr.length -= 1

  // Parse all the payloads.
  payloadsStr.map(utils.parseJSON).forEach(payload => {
    // Ignore payload if it is not considered to be valid.
    if (typeof payload.event !== 'string') return

    // Default Broadcasted args to an empty array.
    const args = payload.args || []

    // Notify the local listeners of the event broadcasted by the TCP Emitter
    // server that the TCP Emitter client is connected to.
    Object.getPrototypeOf(this).emit(payload.event, ...args)
  })
}

/**
 * Function used to send a TCP Emitter Subscribe request to the TCP Emitter
 * server that the TCP Emitter client is connected to. TCP Emitter client will
 * only attempt to send a TCP Emitter Subscribe request when it is connected to
 * a TCP Emitter server.
 * @this {module:tcp-emitter-client}
 * @param  {string} event Name of the event which the new listener has been
 *                        added to.
 */
function subscribe (...events) {
  // Stop from sending a TCP Emitter Subscribe request when the TCP Emitter
  // client is not connected to a TCP Emitter server.
  if (this.socket.remoteAddress === undefined) return

  // Construct the payload to be sent with the TCP Emitter Subscribe request.
  const payload = events.reduce((payload, event) => {
    // Include the TCP Emitter Subscribe payload for the event with the payload
    // to be sent with in the TCP Emitter Subscribe request.
    payload += utils.createSubscribe({
      event, delimiter: this.delimiter
    })

    return payload
  }, '')

  // Send TCP Emitter Subscribe request if there is at least one subscription.
  if (payload.length > 0) this.socket.write(payload)
}

/**
 * Function used to send a TCP Emitter Unsubscribe request to the TCP Emitter
 * server that the TCP Emitter client is connected to. TCP Emitter client will
 * only attempt to send a TCP Emitter Unsubscribe request when it is connected
 * to a TCP Emitter server.
 * @this {module:tcp-emitter-client}
 * @param  {string} event Name of the event which the listener has been removed
 *                        from.
 */
function unsubscribe (...events) {
  // Stop from sending any TCP Emitter Unsubscribe payload when the TCP Emitter
  // client is not connected to a TCP Emitter server.
  if (this.socket.remoteAddress === undefined) return

  // Create the paylaod containing the TCP Emitter Unsubscribe payloads of all
  // the provided events.
  const payload = events.reduce((payload, event) => {
    // Include the TCP Emitter Unsubscribe payload for the event with the
    // payload to be sent with in the TCP Emitter Unsubscribe request.
    payload += utils.createUnsubscribe({
      event, delimiter: this.delimiter
    })

    return payload
  }, '')

  // Send TCP Emitter Unsubscribe request if there is at least one
  // unsubscription.
  if (payload.length > 0) this.socket.write(payload)
}

/**
 * Function used to send a TCP Emitter Broadcast request to the TCP Emitter
 * server that the TCP Emitter client is connected to. TCP Emitter client will
 * only attempt to send a TCP Emitter Broadcast request when it is connected
 * to a TCP Emitter server.
 * @this {module:tcp-emitter-client}
 * @param  {string} event Name of emitted event
 * @param  {...*}   args  Emitted arguments
 */
function broadcast (event, ...args) {
  // Stop from sending any TCP Emitter Broadcast payload when the TCP Emitter
  // client is not connected to a TCP Emitter server.
  if (this.socket.remoteAddress === undefined) return

  // Send TCP Emitter Broadcast request.
  this.socket.write(utils.createBroadcast({
    event, delimiter: this.delimiter, args
  }))
}
