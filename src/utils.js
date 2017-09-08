'use strict'

/**
 * Contains utilities used in `TCP Emitter client`.
 * @module tcp-emitter-utils
 * @type {Object}
 */
module.exports = {
  /**
   * Function used to parse a string into an object, returning an empty object
   * if the string cannot be parsed.
   * @example
   * <caption>Valid Object</caption>
   * const obj = utils.parseJSON('{"name": "luca"}')
   * console.log(typeof obj) // => 'object'
   * console.log(obj)        // => { name: 'luca' }
   *
   * @example
   * <caption>Invalid Object</caption>
   * const obj = utils.parseJSON('luca')
   * console.log(typeof obj) // => 'object'
   * console.log(obj)        // => {}
   * @param  {string} str String to be parsed.
   * @return {Object}     When the string can be parsed into an object, it
   *                      returns the resultant object.
   * @return {Object}     When the string cannot be parsed into an object, it
   *                      returns an empty object.
   */
  parseJSON (str) {
    try {
      return JSON.parse(str)
    } catch (e) {
      return {}
    }
  },

  /**
   * Function used to create a TCP Emitter Subscribe Payload.
   * @example
   * <caption>Creating a TCP Emitter Subscribe Payload</caption>
   * utils.createSubscribe({ event: 'new-user', delimiter: '!!!' })
   * // It will result in the following payload:
   * // '{"type":"subscribe","event":"new-user"}!!!'
   * @see {@link https://github.com/tcp-emitter/server#subscribe|TCP Emitter
   *      Subscribe Payload}
   * @see {@link https://github.com/tcp-emitter/server#delimiter|TCP Emitter
   *      Delimiter}
   * @param  {Object} opts                   Options for createSubscribe
   *                                         function.
   * @param  {string} opts.event             Name of the event that the TCP
   *                                         Emitter client will be subscribing
   *                                         to.
   * @param  {string} [opts.delimiter='@@@'] Delimiter used to seperate payloads
   *                                         in a single TCP request.
   * @return {string}                        TCP Emitter Subscribe Payload.
   */
  createSubscribe ({ event, delimiter = '@@@' }) {
    return `{"type":"subscribe","event":"${event}"}${delimiter}`
  },

  /**
   * Function used to create a TCP Emitter Unsubscribe Payload.
   * @example
   * <caption>Creating a TCP Emitter Unsubscribe Payload</caption>
   * utils.createUnsubscribe({ event: 'new-user', delimiter: '!!!' })
   * // It will result in the following payload:
   * // '{"type":"unsubscribe","event":"new-user"}!!!'
   * @see {@link https://github.com/tcp-emitter/server#unsubscribe|TCP Emitter
   *      Unsubscribe Payload}
   * @see {@link https://github.com/tcp-emitter/server#delimiter|TCP Emitter
   *      Delimiter}
   * @param  {Object} opts                   Options for createUnsubscribe
   *                                         function.
   * @param  {string} opts.event             Name of the event that the TCP
   *                                         Emitter client will be
   *                                         unsubscribing from.
   * @param  {string} [opts.delimiter='@@@'] Delimiter used to seperate
   *                                         payloads in a single TCP request.
   * @return {string}                        TCP Emitter Unubscribe Payload.
   */
  createUnsubscribe ({ event, delimiter = '@@@' }) {
    return `{"type":"unsubscribe","event":"${event}"}${delimiter}`
  },

  /**
   * Function used to create a TCP Emitter Broadcast Payload.
   * @example
   * <caption>Creating a TCP Emitter Broadcast Payload</caption>
   * utils.createBroadcast({
   *   event: 'new-user',
   *   args: [ 1, "2", true, { t: 1 } ],
   *   delimiter: '!!!'
   * })
   * // It will result in the following payload:
   * // '{"type":"broadcast","event":"new-user","args":[1,"2",true,{"t":1}]}!!!'
   * @see {@link https://github.com/tcp-emitter/server#broadcast|TCP Emitter
   *      Broadcast Payload}
   * @see {@link https://github.com/tcp-emitter/server#delimiter|TCP Emitter
   *      Delimiter}
   * @param  {Object} opts                   Options for createBroadcast
   *                                         function.
   * @param  {string} opts.event             Name of the event that the TCP
   *                                         Emitter client will be broadcasting
   *                                         to.
   * @param  {Array.<*>} opts.args           Arguments to be broadcasted.
   * @param  {string} [opts.delimiter='@@@'] Delimiter used to seperate payloads
   *                                         in a single TCP request.
   * @return {string}                        TCP Emitter Broadcast Payload.
   */
  createBroadcast ({ event, args, delimiter = '@@@' }) {
    args = JSON.stringify(args)
    return `{"type":"broadcast","event":"${event}","args":${args}}${delimiter}`
  }
}
