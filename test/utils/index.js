'use strict'

const net = require('net')
const tcpEmitterClient = require('../../src')

module.exports = {
  /**
   * Function used to create a new TCP Server representing a TCP Emitter server
   * on an available port.
   * @return {Promise.<net.Server>}  When the TCP server starts, it returns a
   *                                 promise resolved with the TCP server.
   * @return {Promise.<Error>}       When the TCP server doesn't start due to an
   *                                 error that is not related to a conflict of
   *                                 host/port, it returns a promise rejected
   *                                 with the error.
   */
  createTCPServer () {
    return new Promise((resolve, reject) => {
      /**
       * TCP Server that will represent a TCP Emitter server.
       * @type {net.Server}
       */
      const server = net.createServer()

      /**
       * Port that the TCP Server will be hosted on.
       * @type {number}
       */
      let port = 8080

      /**
       * Function to be used as a listener for the 'error' event of a TCP
       * server. It checks whether the error has occured due to a host/port
       * conflict and if it is the case it tries to start the TCP server on
       * another port. If it is not the case, it rejects the promise sent by
       * this function.
       * @param  {Error} err Error object.
       */
      function errorListener (err) {
        // Stop trying to start the TCP Server & reject the promise if the error
        // is not related to a host/port conflict.
        if (err.code !== 'EADDRINUSE') return reject(err)

        // Try starting the server on another port.
        server.listen(++port)
      }

      // When the TCP Server starts listening it means that it has successfully
      // been started, thus remove the error listener & resolve the promise.
      server.once('listening', () => {
        // Remove the 'error' listener used to restart the server if the error
        // is related to a host/port conflict.
        server.removeListener('error', errorListener)

        // Resolve the promise with the TCP Server.
        resolve(server)
      })

      // Include the 'error' listener used to try restarting the server on
      // another port when the server fails to start due to a host/port
      // conflict.
      server.on('error', errorListener)

      // When a TCP Emitter client connects to the TCP Server:
      //   * Set the default encoding of the TCP Emitter client messages to
      //     utf-8.
      //   * Redirect the data sent by the TCP Emitter client to the server's
      //     'tcp-emitter-client-data' event.
      server.on('connection', client => {
        // Set default encoding to utf-8.
        client.setEncoding('utf-8')

        // Redirect the data sent by the TCP Emitter client to the server's
        // 'tcp-emitter-client-data' event.
        client.on('data', (...args) => {
          server.emit('tcp-emitter-client-data', ...args)
        })
      })

      // Try starting the TCP server.
      server.listen(port)
    })
  },

  /**
   * Function used to close a TCP server.
   * @param  {net.Server} server TCP Server to be closed.
   * @return {Promise}           When the server is closed successfully, it
   *                             returns a resolved promise.
   * @return {Promise.<Error>}   When the server is not closed successfully, it
   *                             returns a promise rejected with the error.
   */
  closeTCPServer (server) {
    return new Promise((resolve, reject) => {
      // When the 'error' event is emitted, it means an error had occured while
      // trying to close the server, thus reject the promise.
      server.once('error', reject)

      // When the 'close' event is emitted, it means that the server has been
      // closed, thus resolve the promise.
      server.once('close', resolve)

      // Try closing server.
      server.close()
    })
  },

  /**
   * Function used to create a new TCP Emitter client and connect it with a
   * TCP server that represents a TCP Emitter server.
   * @param  {string} options                        Options for
   *                                                 createTCPEmitterClient
   *                                                 function.
   * @param  {string} options.address.host           Host of TCP server which
   *                                                 the newly created TCP
   *                                                 Emitter client will be
   *                                                 connecting to.
   * @param  {number} options.address.port           Port of TCP server which
   *                                                 the newly created TCP
   *                                                 Emitter client will be
   *                                                 connecting to.
   * @return {Promise.<module:tcp-emitter-client>}   When the TCP Emitter client
   *                                                 connects with the TCP
   *                                                 server, it returns a
   *                                                 promise resolved with the
   *                                                 newly created TCP Emitter
   *                                                 client.
   * @return {Promise.<Error>}                       When the TCP Emitter client
   *                                                 fails to connect with the
   *                                                 TCP server, it returns a
   *                                                 promise rejected with the
   *                                                 error.
   */
  createTCPEmitterClient (address) {
    return this.connectTCPEmitterClient({ client: tcpEmitterClient(), address })
  },

  /**
   * Function used to connect a TCP Emitter client with a TCP Emitter server.
   * @param  {module:tcp-emitter-client} options.client  TCP Emitter client to
   *                                                     be connected with the
   *                                                     TCP Emitter server.
   * @param  {string} options                            Options for
   *                                                     connectTCPEmitterClient
   *                                                     function.
   * @param  {string} options.address.address            Host of TCP server
   *                                                     which the newly created
   *                                                     TCP Emitter client will
   *                                                     be connecting to.
   * @param  {number} options.address.port               Port of TCP server
   *                                                     which the newly created
   *                                                     TCP Emitter client will
   *                                                     be connecting to.
   * @return {Promise.<module:tcp-emitter-client>}       When the TCP Emitter
   *                                                     client connects with
   *                                                     the TCP server, it
   *                                                     returns a promise
   *                                                     resolved with the newly
   *                                                     created TCP Emitter
   *                                                     client.
   * @return {Promise.<Error>}                           When the TCP Emitter
   *                                                     client fails to connect
   *                                                     with the TCP server, it
   *                                                     returns a promise
   *                                                     rejected with the
   *                                                     error.
   */
  connectTCPEmitterClient ({ client, address }) {
    return new Promise((resolve, reject) => {
      // Set TCP Emitter client encoding.
      client.socket.setEncoding('utf-8')

      // When the 'connect' event is emitted, it means that the TCP Emitter
      // client has successfully connected with TCP server, thus resolve the
      // promise with the client & remove the error event listener.
      client.socket.once('connect', () => {
        client.socket.removeListener('error', reject)
        resolve(client)
      })

      // When the 'error' event is emitted, it means that the TCP Emitter client
      // has failed to connect with the TCP server, thus reject the promise with
      // the error.
      client.socket.once('error', reject)

      // Try to connect with the TCP server.
      client.socket.connect(address)
    })
  },

  /**
   * Function used to close a TCP Emitter client.
   * @param  {module:tcp-emitter-client} client TCP Emitter client to be closed.
   * @return {Promise}                          When the TCP Emitter client is
   *                                            successfully closed, it returns
   *                                            a resolved promise.
   * @return {Promise.<Error>}                  When the TCP Emitter client is
   *                                            not successfully closed, it
   *                                            returns a promise rejected with
   *                                            the error.
   */
  closeTCPEmitterClient (client) {
    return new Promise((resolve, reject) => {
      // If the TCP Emitter client connection has already been closed, do
      // nothing.
      if (client.socket.destroyed === true) return resolve()

      // When the 'error' event is emitted, it means an error had occured while
      // trying to close the TCP Emitter client, thus reject the promise with
      // the error.
      client.socket.once('error', reject)

      // When the 'close' event is emitted, it means that the client has been
      // closed, thus resolve the promise.
      client.socket.once('close', resolve)

      // Try closing the TCP Emitter client.
      client.socket.end()
    })
  }
}
