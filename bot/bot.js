const {
  RtmClient,
  WebClient,
  CLIENT_EVENTS,
  RTM_EVENTS
} = require('@slack/client');

const debug = require('./lib/debug');
const models = require('./models');
const Filter = require('./lib/filter');

function meta (bot) {
  if (!meta.map.has(bot)) {
    meta.map.set(bot, {});
  }
  return meta.map.get(bot);
}

meta.map = new WeakMap();

class Bot {
  constructor (token, opts = {}) {
    if (!token) {
      throw new Error('Missing token');
    }

    const config = Object.assign({ useRtmConnect: false }, opts, {
      autoMark: true,
      autoReconnect: true,
      logger: (logLevel, logString) => {},
      logLevel: 'error'
    });

    meta(this).rtm = new RtmClient(token, config);
    meta(this).web = new WebClient(token);

    meta(this).ready = new Promise((resolve, reject) => {
      const client = meta(this).rtm;

      client.on(CLIENT_EVENTS.RTM.AUTHENTICATED, (state) => {
        debug('Successfully connected');

        const { prefs, ...self } = state.self;
        meta(this).meta = Object.freeze(self);
        resolve(this);
      });

      client.on(CLIENT_EVENTS.RTM.DISCONNECT, (reason) => {
        if (reason === 'account_inactive is not recoverable') {
          debug('Connection failed');
          reject(reason);
        }
      });
    });

    const { dataStore } = meta(this).rtm;
    Object.keys(dataStore.constructor.prototype).forEach((key) => {
      if (key.startsWith('get') && typeof dataStore[key] === 'function') {
        this[key] = (...args) => {
          const data = dataStore[key](...args);
          if (typeof data === 'undefined') return Promise.resolve(undefined);
          // eslint-disable-next-line no-underscore-dangle
          const Model = models[data._modelName];
          return Promise.resolve(new Model(data, this));
        };
      }
    });

    meta(this).handlers = [];

    meta(this).rtm.on(RTM_EVENTS.MESSAGE, (msg) => {
      if (msg.hidden || msg.user === this.meta.id) return;

      models.Message.create(msg, this).then((message) => {
        const handlers = meta(this).handlers;
        debug('Dispatching message to %d handlers: %O', handlers.length, message);

        handlers.every(({ filter, callback }, index) => {
          let rsp = true;

          if (filter.test(message)) {
            debug('Message passed filter: %O', filter);
            rsp = callback.call(this, message, this);
            if (typeof rsp === 'undefined') rsp = true;
          }

          if (!rsp) {
            debug('Breaking after %d iterations', index + 1);
          }

          return !!rsp;
        });
      });
    });
  }

  get meta () {
    return meta(this).meta;
  }

  connect () {
    meta(this).rtm.start();
    return meta(this).ready;
  }

  disconnect () {
    meta(this).rtm.disconnect('client disconnected');
  }

  ready (callback) {
    meta(this).ready.then(callback);
    return this;
  }

  postMessage (target, { text, ...msg }, callback) {
    const message = { ...msg, as_user: true };
    meta(this).web.chat.postMessage(target, text, message, callback);
  }

  onMessage (filter, callback) {
    if (arguments.length === 1 && typeof filter === 'function') {
      // eslint-disable-next-line no-param-reassign
      callback = filter;
      // eslint-disable-next-line no-param-reassign
      filter = undefined;
    }

    if (typeof callback === 'function') {
      meta(this).handlers.push({
        filter: new Filter(filter),
        callback: callback
      });
    }
  }
}

module.exports = Bot;
