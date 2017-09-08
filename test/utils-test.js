'use strict'

const assert = require('assert')
const utils = require('../src/utils')

describe('TCP Emitter Client Utils Tests:', function () {
  describe('Scenario: Parsing a parsable string into an object:', function () {
    describe('Given a parsable string,', function () {
      /**
       * String to be parsed.
       * @type {string}
       */
      let message = null

      /**
       * Object expected once the string is parsed.
       * @type {Object}
       */
      let expected = null

      beforeEach(function () {
        expected = { name: 'luca' }
        message = JSON.stringify(expected)
      })

      describe('when parsing it into an object:', function () {
        /**
         * Object created from parsing.
         * @type {Objec}
         */
        let actual = null

        beforeEach(function () {
          actual = utils.parseJSON(message)
        })

        it('should return an object representation of the string', function () {
          assert.deepStrictEqual(actual, expected)
        })
      })
    })
  })

  describe('Scenario: Parsing a non-parsable string into an object:', function () {
    describe('Given a non-parsable string,', function () {
      /**
       * String to be parsed.
       * @type {string}
       */
      let message = null

      beforeEach(function () {
        message = 'this is not a parsable string'
      })

      describe('when parsing it into an object:', function () {
        /**
         * Object created from parsing.
         * @type {Objec}
         */
        let actual = null

        beforeEach(function () {
          actual = utils.parseJSON(message)
        })

        it('should return an empty object', function () {
          assert.deepStrictEqual(actual, {})
        })
      })
    })
  })

  describe('Scenario: Creating a TCP Emitter Subscribe payload:', function () {
    describe('Given an event & a delimiter,', function () {
      /**
       * Name of the event which the TCP Emitter client will be subscribing to.
       * @type {string}
       */
      let event = null

      /**
       * Delimiter used to seperate payloads in a single TCP request.
       * @type {string}
       */
      let delimiter = null

      beforeEach(function () {
        event = 'event-name'
        delimiter = '!!!'
      })

      describe('when creating a TCP Emitter Subscribe payload:', function () {
        /**
         * Resultant TCP Emitter Subscribe payload.
         * @type {string}
         */
        let payload = null

        beforeEach(function () {
          payload = utils.createSubscribe({ event, delimiter })
        })

        it('should create it accordingly', function () {
          assert.strictEqual(payload,
            `{"type":"subscribe","event":"${event}"}${delimiter}`)
        })
      })
    })
  })

  describe('Scenario: Creating a TCP Emitter Unsubscribe payload:', function () {
    describe('Given an event & a delimiter,', function () {
      /**
       * Name of the event which the TCP Emitter client will be unsubscribing
       * from.
       * @type {string}
       */
      let event = null

      /**
       * Delimiter used to seperate payloads in a single TCP request.
       * @type {string}
       */
      let delimiter = null

      beforeEach(function () {
        event = 'event-name'
        delimiter = '!!!'
      })

      describe('when creating a TCP Emitter Unsubscribe payload:', function () {
        /**
         * Resultant TCP Emitter Unsubscribe payload.
         * @type {string}
         */
        let payload = null

        beforeEach(function () {
          payload = utils.createUnsubscribe({ event, delimiter })
        })

        it('should create it accordingly', function () {
          assert.strictEqual(payload,
            `{"type":"unsubscribe","event":"${event}"}${delimiter}`)
        })
      })
    })
  })

  describe('Scenario: Creating a TCP Emitter Broadcast payload:', function () {
    describe('Given an event, a delimiter & a number of args,', function () {
      /**
       * Arguments to be broadcasted.
       * @type {string}
       */
      let args = null

      /**
       * Name of the event which the TCP Emitter client will be broadcasting to.
       * @type {string}
       */
      let event = null

      /**
       * Delimiter used to seperate payloads in a single TCP request.
       * @type {string}
       */
      let delimiter = null

      beforeEach(function () {
        delimiter = '!!!'
        event = 'event-name'
        args = [ 1, '2', true, { name: 'luca' } ]
      })

      describe('when creating a TCP Emitter Broadcast payload:', function () {
        /**
         * Resultant TCP Emitter Broadcast payload.
         * @type {string}
         */
        let payload = null

        beforeEach(function () {
          payload = utils.createBroadcast({ event, delimiter, args })
        })

        it('should create it accordingly', function () {
          const expectedPayload = `{"type":"broadcast","event":"${event}",` +
            `"args":${JSON.stringify(args)}}` + delimiter

          assert.strictEqual(payload, expectedPayload)
        })
      })
    })
  })
})
