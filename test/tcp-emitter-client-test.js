'use strict'

const assert = require('assert')
const sinon = require('sinon')
const utils = require('./utils')
const tcpEmitterClient = require('../src')

describe('TCP Emitter Client Tests:', function () {
  describe('Scenario: Adding the first listener to an event in a TCP Emitter client that is not connected to a TCP Emitter server:', function () {
    describe('Given a TCP Emitter client that is not connected to a TCP Emitter server,', function () {
      /**
       * TCP Emitter client instance.
       * @type {module:tcp-emitter-client}
       */
      let clientInst = null

      beforeEach(function () {
        // Create TCP Emitter client.
        clientInst = tcpEmitterClient()
      })

      describe('when adding the first listener of an event:', function () {
        /**
         * Name of the event which the first listener will be added to.
         */
        let event = null

        /**
         * Listener to be added to an event.
         * @type {Function}
         */
        let listener = null

        beforeEach(function () {
          // Setup event name.
          event = 'event-name'

          // Setup listener.
          listener = () => {}

          // Stub 'clientInst.socket.write' to check whether the TCP Emitter
          // client attempts to send a TCP Emitter Subscribe request.
          sinon.stub(clientInst.socket, 'write')

          // Add first listener to an event.
          clientInst.on(event, listener)
        })

        afterEach(function () {
          clientInst.socket.write.restore()
        })

        it('should not send a TCP Emitter Subscribe request', function () {
          // Assert that the TCP Emitter client didn't attempted to send a TCP
          // Emitter Subscribe request when it is not connected to a TCP Emitter
          // server.
          assert.ok(clientInst.socket.write.notCalled)
        })

        it('should add the listener to the event', function () {
          // Assert that even though the TCP Emitter client is not connected to
          // a TCP Emitter server, it still functions as a normal EventEmitter.
          assert.strictEqual(clientInst.listenerCount(event), 1)
          assert.ok(clientInst.listeners(event).indexOf(listener) !== -1)
        })
      })
    })
  })

  describe('Scenario: Removing the last listener from an event in a TCP Emitter client that is not connected to a TCP Emitter server:', function () {
    describe('Given a TCP Emitter client that is not connected to a TCP Emitter server,', function () {
      /**
       * TCP Emitter client instance.
       * @type {module:tcp-emitter-client}
       */
      let clientInst = null

      beforeEach(function () {
        // Create TCP Emitter client.
        clientInst = tcpEmitterClient()
      })

      describe('that has an event with one listener,', function () {
        /**
         * Name of the event which will have one listener.
         */
        let event = null

        /**
         * Listener of the event.
         * @type {Function}
         */
        let listener = null

        beforeEach(function () {
          // Setup event name.
          event = 'event-name'

          // Setup listener.
          listener = () => {}

          // Stub 'clientInst.socket.write' to check whether the TCP Emitter
          // client attempts to send a TCP Emitter Unsubscribe request.
          sinon.stub(clientInst.socket, 'write')

          // Add listener to the event.
          clientInst.on(event, listener)

          // Reset the stub for any invocations done by subscription process.
          // Note that since the TCP Emitter client being used in this test case
          // is not connected to a TCP Emitter server, it won't try to send a
          // TCP Emitter subscribe request and thus the restoration of the stub
          // is some what redundant. However in this test case we are testing
          // whether the TCP Emitter client sends any TCP Unsubscribe request
          // and thus if for some reason the TCP Emitter client sends a TCP
          // Emitter Subscribe request it should not fail this test case. If
          // this happens it should be caught by the respective test case.
          clientInst.socket.write.reset()
        })

        afterEach(function () {
          clientInst.socket.write.restore()
        })

        describe('when removing its last listener:', function () {
          beforeEach(function () {
            // Remove last listener of the event.
            clientInst.removeListener(event, listener)
          })

          it('should not send a TCP Emitter Unsubscribe request', function () {
            // Assert that the TCP Emitter client didn't attempted to send a TCP
            // Emitter Unsubscribe request when it is not connected to a TCP
            // Emitter server.
            assert.ok(clientInst.socket.write.notCalled)
          })

          it('should remove the listener from the event', function () {
            // Assert that even though the TCP Emitter client is not connected
            // to a TCP Emitter server, it still functions as a normal
            // EventEmitter.
            assert.strictEqual(clientInst.listenerCount(event), 0)
          })
        })
      })
    })
  })

  describe('Scenario: Emitting an event in a TCP Emitter client that is not connected to a TCP Emitter server:', function () {
    describe('Given a TCP Emitter client that is not connected to a TCP Emitter server,', function () {
      /**
       * TCP Emitter client instance.
       * @type {module:tcp-emitter-client}
       */
      let clientInst = null

      beforeEach(function () {
        // Create TCP Emitter client.
        clientInst = tcpEmitterClient()
      })

      describe('that has an event with a listener,', function () {
        /**
         * Name of the event to be emitted.
         */
        let event = null

        /**
         * Listener of the event to be emitted.
         * @type {Function}
         */
        let listener = null

        beforeEach(function () {
          // Setup event name.
          event = 'event-name'

          // Setup listener.
          listener = sinon.stub()

          // Stub 'clientInst.socket.write' to check whether the TCP Emitter
          // client attempts to send a TCP Emitter Broadcast request.
          sinon.stub(clientInst.socket, 'write')

          // Add listener to the event to be emitted.
          clientInst.on(event, listener)

          // Reset the stub for any invocations done by subscription process.
          // Note that since the TCP Emitter client being used in this test case
          // is not connected to a TCP Emitter server, it won't try to send a
          // TCP Emitter Subscribe request and thus the restoration of the stub
          // is some what redundant. However in this test case we are testing
          // whether the TCP Emitter client sends any TCP Broadcast request
          // and thus if for some reason the TCP Emitter client sends a TCP
          // Emitter Subscribe request it should not fail this test case. If
          // this happens it should be caught by the respective test case.
          clientInst.socket.write.reset()
        })

        afterEach(function () {
          clientInst.socket.write.restore()
        })

        describe('when emitting an event with a number of arguments:', function () {
          /**
           * Arguments to be emitted.
           * @type {Array}
           */
          let args = null

          beforeEach(function () {
            // Setup arguments to be emitted.
            args = [ 1, '2', true, { name: 'luca' } ]

            // Emit the event with the arguments.
            clientInst.emit(event, ...args)
          })

          it('should not send a TCP Emitter Broadcast request', function () {
            // Assert that the TCP Emitter client didn't attempted to send a TCP
            // Emitter Broadcast request when it is not connected to a TCP
            // Emitter server.
            assert.ok(clientInst.socket.write.notCalled)
          })

          it('should invoke the local listener of the event', function () {
            // Assert that even though the TCP Emitter client is not connected
            // to a TCP Emitter server, it still functions as a normal
            // EventEmitter.
            assert.ok(listener.calledOnce)
            assert.deepStrictEqual(listener.getCall(0).args, args)
          })
        })
      })
    })
  })

  describe('Scenario: Adding the first listener to an event in a TCP Emitter client that is connected to a TCP Emitter server:', function () {
    describe('Given a TCP Emitter server,', function () {
      /**
       * TCP Emitter server instance.
       * @type {net.Server}
       */
      let serverInst = null

      beforeEach(function () {
        // Create TCP Emitter server.
        return utils.createTCPServer().then(server => { serverInst = server })
      })

      afterEach(function () {
        return utils.closeTCPServer(serverInst)
      })

      describe('with a connected TCP Emitter client,', function () {
        /**
         * TCP Emitter client instance.
         * @this {module:tcp-emitter-client}
         */
        let clientInst = null

        beforeEach(function () {
          // Create TCP Emitter client & connect it with TCP Emitter server.
          return utils.createTCPEmitterClient(serverInst.address())
            .then(client => { clientInst = client })
        })

        afterEach(function () {
          return utils.closeTCPEmitterClient(clientInst)
        })

        describe('when adding the first listener of an event:', function () {
          /**
           * Name of the event which the first listener will be added to.
           */
          let event = null

          /**
           * Listener to be added to an event.
           * @type {Function}
           */
          let listener = null

          beforeEach(function () {
            // Setup event name.
            event = 'event-name'

            // Setup listener.
            listener = () => {}
          })

          it('should send a TCP Emitter Subscribe request', function (done) {
            serverInst.on('tcp-emitter-client-data', message => {
              // Assert that the TCP Emitter client has sent a well structured
              // TCP Emitter Subscribe request to the TCP Emitter server.
              assert.strictEqual(message,
                `{"type":"subscribe","event":"${event}"}@@@`)

              done()
            })

            // Add first listener to an event.
            clientInst.on(event, listener)
          })

          it('should add the listener to the event', function () {
            // Add first listener to an event.
            clientInst.on(event, listener)

            // Assert that even though the TCP Emitter client is connected to a
            // TCP Emitter server, it still functions as a normal EventEmitter.
            assert.strictEqual(clientInst.listenerCount(event), 1)
            assert.ok(clientInst.listeners(event).indexOf(listener) !== -1)
          })
        })
      })
    })
  })

  describe('Scenario: Removing the last listener from an event in a TCP Emitter client that is connected to a TCP Emitter server:', function () {
    describe('Given a TCP Emitter server,', function () {
      /**
       * TCP Emitter server instance.
       * @type {net.Server}
       */
      let serverInst = null

      beforeEach(function () {
        // Create TCP Emitter server.
        return utils.createTCPServer().then(server => { serverInst = server })
      })

      afterEach(function () {
        return utils.closeTCPServer(serverInst)
      })

      describe('with a connected TCP Emitter client,', function () {
        /**
         * TCP Emitter client instance.
         * @this {module:tcp-emitter-client}
         */
        let clientInst = null

        beforeEach(function () {
          // Create TCP Emitter client & connect it with TCP Emitter server.
          return utils.createTCPEmitterClient(serverInst.address())
            .then(client => { clientInst = client })
        })

        afterEach(function () {
          return utils.closeTCPEmitterClient(clientInst)
        })

        describe('that has an event with one listener,', function () {
          /**
           * Name of the event which will have one listener.
           */
          let event = null

          /**
           * Listener of the event.
           * @type {Function}
           */
          let listener = null

          beforeEach(function () {
            // Setup event name.
            event = 'event-name'

            // Setup listener.
            listener = () => {}

            // Stub 'clientInst.socket.write' to prevent it from sending TCP
            // Emitter Subscribe requests.
            sinon.stub(clientInst.socket, 'write')

            // Add listener to the event.
            clientInst.on(event, listener)
          })

          describe('when removing its last listener:', function () {
            beforeEach(function () {
              // Restore 'clientInst.socket.write' to allow the TCP Emitter
              // client to send the TCP Emitter Unsubscribe request.
              clientInst.socket.write.restore()
            })

            it('should send a TCP Emitter Unsubscribe request', function (done) {
              serverInst.on('tcp-emitter-client-data', message => {
                // Assert that the TCP Emitter client has sent a well
                // structured TCP Emitter Unsubscribe request to the TCP
                // Emitter server.
                assert.strictEqual(message,
                  `{"type":"unsubscribe","event":"${event}"}@@@`)

                done()
              })

              // Remove last listener of the event.
              clientInst.removeListener(event, listener)
            })

            it('should remove the listener from the event', function () {
              // Remove last listener of the event.
              clientInst.removeListener(event, listener)

              // Assert that even though the TCP Emitter client is connected to
              // a TCP Emitter server, it still functions as a normal
              // EventEmitter.
              assert.strictEqual(clientInst.listenerCount(event), 0)
            })
          })
        })
      })
    })
  })

  describe('Scenario: Emitting an event in a TCP Emitter client that is connected to a TCP Emitter server:', function () {
    describe('Given a TCP Emitter server,', function () {
      /**
       * TCP Emitter server instance.
       * @type {net.Server}
       */
      let serverInst = null

      beforeEach(function () {
        // Create TCP Emitter server.
        return utils.createTCPServer().then(server => { serverInst = server })
      })

      afterEach(function () {
        return utils.closeTCPServer(serverInst)
      })

      describe('with a connected TCP Emitter client,', function () {
        /**
         * TCP Emitter client instance.
         * @this {module:tcp-emitter-client}
         */
        let clientInst = null

        beforeEach(function () {
          // Create TCP Emitter client & connect it with TCP Emitter server.
          return utils.createTCPEmitterClient(serverInst.address())
            .then(client => { clientInst = client })
        })

        afterEach(function () {
          return utils.closeTCPEmitterClient(clientInst)
        })

        describe('that has an event with a listener,', function () {
          /**
           * Name of the event to be emitted.
           */
          let event = null

          /**
           * Listener of the event.
           * @type {Function}
           */
          let listener = null

          beforeEach(function () {
            // Setup event name.
            event = 'event-name'

            // Setup listener.
            listener = sinon.stub()

            // Stub 'clientInst.socket.write' to prevent it from sending TCP
            // Emitter Subscribe requests.
            sinon.stub(clientInst.socket, 'write')

            // Add listener to the event to be emitted.
            clientInst.on(event, listener)
          })

          describe('when emitting an event with a number of arguments:', function () {
            /**
             * Arguments to be emitted.
             * @type {Array}
             */
            let args = null

            beforeEach(function () {
              // Setup arguments to be emitted.
              args = [ 1, '2', true, { name: 'luca' } ]

              // Restore 'clientInst.socket.write' to allow the TCP Emitter
              // client to send the TCP Emitter Broadcast request.
              clientInst.socket.write.restore()
            })

            it('should send a TCP Emitter Broadcast request', function (done) {
              serverInst.on('tcp-emitter-client-data', message => {
                // Assert that the TCP Emitter client has sent a well
                // structured TCP Emitter Broadcast request to the TCP
                // Emitter server.
                assert.strictEqual(message,
                  `{"type":"broadcast","event":"${event}","args":` +
                  `[1,"2",true,{"name":"luca"}]}@@@`)

                done()
              })

              // Emit the event with the arguments.
              clientInst.emit(event, ...args)
            })

            it('should invoke the local listener of the event', function () {
              // Emit the event with the arguments.
              clientInst.emit(event, ...args)

              // Assert that even though the TCP Emitter client is connected to
              // a TCP Emitter server, it still functions as a normal
              // EventEmitter.
              assert.ok(listener.calledOnce)
              assert.deepStrictEqual(listener.getCall(0).args, args)
            })
          })
        })
      })
    })
  })

  describe('Scenario: Connecting to a TCP Emitter server with a TCP Emitter client that has been used as a normal EventEmitter:', function () {
    describe('Given a TCP Emitter client,', function () {
      /**
       * TCP Emitter client instance.
       * @type {module:tcp-emitter-client}
       */
      let clientInst = null

      beforeEach(function () {
        // Create TCP Emitter client.
        clientInst = tcpEmitterClient()
      })

      describe('that was used as a normal EventEmitter,', function () {
        beforeEach(function () {
          clientInst.on('a', () => {})
          clientInst.on('b', () => {})
          clientInst.on('b', () => {})

          const listener = () => {}
          clientInst.on('c', listener)
          clientInst.removeListener('c', listener)

          clientInst.on('d', () => {})
        })

        describe('when connecting it with a TCP Emitter server:', function () {
          /**
           * TCP Emitter server instance.
           * @type {net.Server}
           */
          let serverInst = null

          beforeEach(function () {
            // Create a TCP Emitter server.
            return utils.createTCPServer()
              .then(server => { serverInst = server })
          })

          afterEach(function () {
            return utils.closeTCPServer(serverInst)
          })

          it('should subscribe to all the events for which it has registered listeners', function (done) {
            serverInst.on('tcp-emitter-client-data', message => {
              // Assert that the TCP Emitter client has sent a well structured
              // TCP Emitter Subscribe request to the TCP Emitter server.
              assert.strictEqual(message,
                '{"type":"subscribe","event":"a"}@@@' +
                '{"type":"subscribe","event":"b"}@@@' +
                '{"type":"subscribe","event":"d"}@@@')

              done()
            })

            // Connect the TCP Emitter client to the TCP Emitter server.
            utils.connectTCPEmitterClient({
              client: clientInst,
              address: serverInst.address()
            }).catch(done).then(() => {
              // Close TCP Emitter client.
              utils.closeTCPEmitterClient(clientInst)
            })
          })
        })
      })
    })
  })

  describe('Scenario: Receiving a valid Broadcast payload from the TCP Emitter server:', function () {
    describe('Given a TCP Emitter server,', function () {
      /**
       * TCP Emitter server instance.
       * @type {net.Server}
       */
      let serverInst = null

      beforeEach(function () {
        // Create TCP Emitter server.
        return utils.createTCPServer().then(server => { serverInst = server })
      })

      afterEach(function () {
        return utils.closeTCPServer(serverInst)
      })

      describe('with a connected TCP Emitter client,', function () {
        /**
         * TCP Emitter client instance.
         * @this {module:tcp-emitter-client}
         */
        let clientInst = null

        beforeEach(function () {
          // Create TCP Emitter client & connect it with TCP Emitter server.
          return utils.createTCPEmitterClient(serverInst.address())
            .then(client => { clientInst = client })
        })

        afterEach(function () {
          return utils.closeTCPEmitterClient(clientInst)
        })

        describe('that has a number of event listeners,', function () {
          /**
           * One of the events of TCP Emitter client.
           * @type {string}
           */
          let eventOne = null

          /**
           * One of the events of TCP Emitter client.
           * @type {string}
           */
          let eventTwo = null

          /**
           * One of the events of TCP Emitter client.
           * @type {string}
           */
          let eventThree = null

          /**
           * One of the listeners of TCP Emitter client.
           * @type {Function}
           */
          let listenerOne = null

          /**
           * One of the listeners of TCP Emitter client.
           * @type {Function}
           */
          let listenerTwo = null

          /**
           * One of the listeners of TCP Emitter client.
           * @type {Function}
           */
          let listenerThree = null

          beforeEach(function () {
            // Setup event names.
            eventOne = 'event-name-one'
            eventTwo = 'event-name-two'
            eventThree = 'event-name-three'

            // Setup listeners.
            listenerOne = sinon.stub()
            listenerTwo = sinon.stub()
            listenerThree = sinon.stub()

            // Add event listeners.
            clientInst.on(eventOne, listenerOne)
            clientInst.on(eventTwo, listenerTwo)
            clientInst.on(eventThree, listenerThree)
          })

          describe('when the TCP Emitter server sends a valid Broadcast request to the TCP Emitter client:', function () {
            beforeEach(function () {
              // Stub 'clientInst.socket.write' to check whether the TCP Emitter
              // client attempts to echo back the TCP Emitter Broadcast request.
              sinon.stub(clientInst.socket, 'write')

              // Emit Broadcast Request.
              clientInst.socket.emit('data',
                `{"event":"${eventOne}","args":[1,"2",true,{"name":"luca"}]}` +
                `@@@{"event":"${eventThree}",` +
                `"args":[2,"3",false,{"surname":"tabone"}]}@@@`)
            })

            it('should invoke the local listeners of the event specified in the TCP Emitter Broadcast request', function () {
              // Assert that listenerTwo was not invoked since it wasn't
              // listening to the events specified in the TCP Emitter Broadcast
              // request.
              assert.ok(listenerTwo.notCalled)

              // Assert that listenerOne was invoked once, since it was
              // listening to the events specified in the TCP Emitter Broadcast
              // request.
              assert.ok(listenerOne.calledOnce)

              // Assert that listenerThree was invoked once, since it was
              // listening to the events specified in the TCP Emitter Broadcast
              // request.
              assert.ok(listenerThree.calledOnce)

              // Assert that listenerOne was invoked with the arguments
              // specified in the TCP Emitter Broadcast request.
              assert.deepStrictEqual(listenerOne.getCall(0).args,
                [ 1, '2', true, { name: 'luca' } ])

              // Assert that listenerThree was invoked with the arguments
              // specified in the TCP Emitter Broadcast request.
              assert.deepStrictEqual(listenerThree.getCall(0).args,
                [ 2, '3', false, { surname: 'tabone' } ])
            })

            it('should not echo the TCP Emitter Broadcast request back to the TCP Emitter server', function () {
              assert.ok(clientInst.socket.write.notCalled)
            })
          })
        })
      })
    })
  })

  describe('Scenario: Receiving an invalid Broadcast payload from the TCP Emitter server:', function () {
    describe('Given a TCP Emitter server,', function () {
      /**
       * TCP Emitter server instance.
       * @type {net.Server}
       */
      let serverInst = null

      beforeEach(function () {
        // Create TCP Emitter server.
        return utils.createTCPServer().then(server => { serverInst = server })
      })

      afterEach(function () {
        return utils.closeTCPServer(serverInst)
      })

      describe('with a connected TCP Emitter client,', function () {
        /**
         * TCP Emitter client instance.
         * @this {module:tcp-emitter-client}
         */
        let clientInst = null

        beforeEach(function () {
          // Create TCP Emitter client & connect it with TCP Emitter server.
          return utils.createTCPEmitterClient(serverInst.address())
            .then(client => { clientInst = client })
        })

        afterEach(function () {
          return utils.closeTCPEmitterClient(clientInst)
        })

        describe('that has a number of event listeners,', function () {
          /**
           * One of the events of TCP Emitter client.
           * @type {string}
           */
          let eventOne = null

          /**
           * One of the events of TCP Emitter client.
           * @type {string}
           */
          let eventTwo = null

          /**
           * One of the events of TCP Emitter client.
           * @type {string}
           */
          let eventThree = null

          /**
           * One of the listeners of TCP Emitter client.
           * @type {Function}
           */
          let listenerOne = null

          /**
           * One of the listeners of TCP Emitter client.
           * @type {Function}
           */
          let listenerTwo = null

          /**
           * One of the listeners of TCP Emitter client.
           * @type {Function}
           */
          let listenerThree = null

          beforeEach(function () {
            // Setup event names.
            eventOne = 'event-name-one'
            eventTwo = 'event-name-two'
            eventThree = 'event-name-three'

            // Setup listeners.
            listenerOne = sinon.stub()
            listenerTwo = sinon.stub()
            listenerThree = sinon.stub()

            // Add event listeners.
            clientInst.on(eventOne, listenerOne)
            clientInst.on(eventTwo, listenerTwo)
            clientInst.on(eventThree, listenerThree)
          })

          describe('when the TCP Emitter server sends a invalid Broadcast request to the TCP Emitter client:', function () {
            beforeEach(function () {
              // Stub 'clientInst.socket.write' to check whether the TCP Emitter
              // client attempts to echo back the TCP Emitter Broadcast request.
              sinon.stub(clientInst.socket, 'write')

              // Emit Broadcast Request.
              clientInst.socket.emit('data', `{"invalid":"${eventOne}"}@@@`)
            })

            it('should not invoke any of the listeners', function () {
              // Assert that none of the listeners were invoked.
              assert.ok(listenerTwo.notCalled)
              assert.ok(listenerOne.notCalled)
            })

            it('should not echo the TCP Emitter Broadcast request back to the TCP Emitter server', function () {
              assert.ok(clientInst.socket.write.notCalled)
            })
          })
        })
      })
    })
  })

  describe('Scenario: Adding a listener to an event that already has its own listeners in a TCP Emitter client that is connected to a TCP Emitter server:', function () {
    describe('Given a TCP Emitter server,', function () {
      /**
       * TCP Emitter server instance.
       * @type {net.Server}
       */
      let serverInst = null

      beforeEach(function () {
        // Create TCP Emitter server.
        return utils.createTCPServer().then(server => { serverInst = server })
      })

      afterEach(function () {
        return utils.closeTCPServer(serverInst)
      })

      describe('with a connected TCP Emitter client,', function () {
        /**
         * TCP Emitter client instance.
         * @this {module:tcp-emitter-client}
         */
        let clientInst = null

        beforeEach(function () {
          // Create TCP Emitter client & connect it with TCP Emitter server.
          return utils.createTCPEmitterClient(serverInst.address())
            .then(client => { clientInst = client })
        })

        afterEach(function () {
          return utils.closeTCPEmitterClient(clientInst)
        })

        describe('that has a number of event listeners,', function () {
          /**
           * Name of the event that the listeners of this test case will be
           * listening to.
           * @type {string}
           */
          let event = null

          /**
           * Listener that will represent the listeners already added to the
           * event that the listeners of this test case will be listening to.
           * @type {Function}
           */
          let listenerOne = null

          beforeEach(function () {
            // Setup event name.
            event = 'event-one'

            // Setup listener.
            listenerOne = () => {}

            // Add event listener.
            clientInst.on(event, listenerOne)
          })

          describe('when adding a listener to an event that already has its own listeners:', function () {
            /**
             * Listener that will be listening on an event that already has its
             * own listeners.
             * @type {Function}
             */
            let listenerTwo = null

            beforeEach(function () {
              // Setup listener
              listenerTwo = () => {}

              // Stub 'clientInst.socket.write' to check whether the TCP Emitter
              // client attempts to send a TCP Emitter Subscribe request when
              // adding a listener to an event that already has its own
              // listeners.
              sinon.stub(clientInst.socket, 'write')

              // Add listener to an event that already has its own listeners.
              clientInst.on(event, listenerTwo)
            })

            afterEach(function () {
              clientInst.socket.write.restore()
            })

            it('should not send a TCP Emitter Subscribe request', function () {
              // Assert that the TCP Emitter client didn't attempted to send a
              // TCP Emitter Subscribe request when adding a listener to an
              // event that already has its own listeners.
              assert.ok(clientInst.socket.write.notCalled)
            })

            it('should add the listener to the event', function () {
              // Assert that even though the TCP Emitter client didn't sent a
              // TCP Emitter Subscribe request, it still functions as a normal
              // EventEmitter.
              assert.strictEqual(clientInst.listenerCount(event), 2)
              assert.ok(clientInst.listeners(event).indexOf(listenerOne) !== -1)
              assert.ok(clientInst.listeners(event).indexOf(listenerTwo) !== -1)
            })
          })
        })
      })
    })
  })

  describe('Scenario: Removing a listener from an event that has other listeners in a TCP Emitter client that is connected to a TCP Emitter server:', function () {
    describe('Given a TCP Emitter server,', function () {
      /**
       * TCP Emitter server instance.
       * @type {net.Server}
       */
      let serverInst = null

      beforeEach(function () {
        // Create TCP Emitter server.
        return utils.createTCPServer().then(server => { serverInst = server })
      })

      afterEach(function () {
        return utils.closeTCPServer(serverInst)
      })

      describe('with a connected TCP Emitter client,', function () {
        /**
         * TCP Emitter client instance.
         * @this {module:tcp-emitter-client}
         */
        let clientInst = null

        beforeEach(function () {
          // Create TCP Emitter client & connect it with TCP Emitter server.
          return utils.createTCPEmitterClient(serverInst.address())
            .then(client => { clientInst = client })
        })

        afterEach(function () {
          return utils.closeTCPEmitterClient(clientInst)
        })

        describe('that has a number of event listeners,', function () {
          /**
           * Name of the event that the listener will be removed from for this
           * test case.
           * @type {string}
           */
          let event = null

          /**
           * One of the listeners of TCP Emitter client.
           * @type {Function}
           */
          let listenerOne = null

          /**
           * One of the listeners of TCP Emitter client.
           * @type {Function}
           */
          let listenerTwo = null

          beforeEach(function () {
            // Setup event name.
            event = 'event-one'

            // Setup listener.
            listenerOne = () => {}
            listenerTwo = () => {}

            // Add event listener.
            clientInst.on(event, listenerOne)
            clientInst.on(event, listenerTwo)
          })

          describe('when removing a listener from an event that has other listeners:', function () {
            beforeEach(function () {
              // Stub 'clientInst.socket.write' to check whether the TCP Emitter
              // client attempts to send a TCP Emitter Unsubscribe request when
              // removing a listener from an event that has other listeners
              // registered to it.
              sinon.stub(clientInst.socket, 'write')

              // Remove listener from an event that has other listeners
              // registered to it.
              clientInst.removeListener(event, listenerOne)
            })

            afterEach(function () {
              clientInst.socket.write.restore()
            })

            it('should not send a TCP Emitter Unsubscribe request', function () {
              // Assert that the TCP Emitter client didn't attempted to send a
              // TCP Emitter Unsbscribe request when removing a listener from an
              // event that has other listeners registered to it.
              assert.ok(clientInst.socket.write.notCalled)
            })

            it('should remove the listener from the event', function () {
              // Assert that even though the TCP Emitter client didn't sent a
              // TCP Emitter Unsubscribe request, it still functions as a normal
              // EventEmitter.
              assert.strictEqual(clientInst.listenerCount(event), 1)
              assert.ok(clientInst.listeners(event).indexOf(listenerOne) === -1)
              assert.ok(clientInst.listeners(event).indexOf(listenerTwo) !== -1)
            })
          })
        })
      })
    })
  })
})
