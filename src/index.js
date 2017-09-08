'use strict'

const EventEmitter = require('events')
const tcpEmitterClient = require('./tcp-emitter-client')

/**
 * Function used to create a new TCP Emitter client. A TCP Emitter client is an
 * EventEmitter that can connect with a TCP Emitter server to interact with
 * other connected clients.
 * @module create-tcp-emitter-client
 *
 * @example
 * <caption>Creating a new TCP Emitter client</caption>
 * const clientInst = require('tcp-emitter-client')()
 *
 * // Function to serve as a listener for this example.
 * const listener = (name) => console.log(`Hello ${name}`)
 *
 * // When adding a listener to an event before connecting to a TCP Emitter
 * // server, TCP Emitter client will function as a normal EventEmitter and thus
 * // refrain from sending a TCP Emitter subscribe request.
 * clientInst.on('new-user', listener)
 *
 * // When connecting to a TCP Emitter server, TCP Emitter client will subscribe
 * // to all the events it currently has registered. By doing this its listeners
 * // will be invoked when a connected client emits the same events.
 * clientInst.connect(8080)
 *
 * // When adding the first listener to an event in TCP Emitter client after
 * // connecting to a TCP Emitter server, TCP Emitter client will automatically
 * // send a TCP Emitter Subscribe request to the TCP Emitter server it is
 * // connected to. By doing this the listener & future listeners of the event
 * // will be invoked whenever a connected client emits the same event.
 * clientInst.on('remove-user', listener)
 *
 * // When removing the last listener from a TCP Emitter client after connecting
 * // to a TCP Emitter server, TCP Emitter client will automatically send a TCP
 * // Emitter Unsubscribe request to the TCP Emitter server it is connected to.
 * clientInst.removeListener('remove-user', listener)
 *
 * // When emitting an event after connecting the TCP Emitter client to a TCP
 * // Emitter server, TCP Emitter client will automatically send a TCP Emitter
 * // Broadcast request to the TCP Emitter server it is connected to. By doing
 * // this it will invoke the listeners of all the other connected clients.
 * clientInst.emit('new-user', [1, '2', true, { name: 'luca' }])
 *
 * @see {@link https://nodejs.org/api/events.html|EventEmitter}
 * @see {@link https://github.com/tcp-emitter/server|TCP Emitter Server}
 * @see {@link https://github.com/tcp-emitter/server#delimiter|TCP Emitter
 *      Delimiter}
 * @param  {Object} [opts={}]              TCP Emitter client options.
 * @param  {string} [opts.delimiter='@@@'] Delimiter used to seperate payloads
 *                                         in a single TCP request.
 * @return {Object}                        TCP Emitter client.
 */
module.exports = function createTCPEmitterClient (opts = {}) {
  /**
   * TCP Emitter client object.
   * @type {module:tcp-emitter-client}
   */
  const tcpEmitterClientInst = Object.assign(Object.create(new EventEmitter()),
    tcpEmitterClient)

  // Initialize the newly created TCP Emitter client.
  tcpEmitterClientInst.init(opts)

  // Return the TCP Emitter client.
  return tcpEmitterClientInst
}
