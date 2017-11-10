const Message = require('./message');
const Model = require('./model');
const Filter = require('../lib/filter');

class Channel extends Model {
  onMessage (filter, callback) {
    if (arguments.length === 1 && typeof filter === 'function') {
      // eslint-disable-next-line no-param-reassign
      callback = filter;
      // eslint-disable-next-line no-param-reassign
      filter = undefined;
    }

    // eslint-disable-next-line no-param-reassign
    filter = new Filter(filter);

    this._bot.onMessage(this, (message) => {
      if (!filter.test(message)) return;

      let rsp = callback.call(this, message, this, this._bot);
      if (typeof rsp === 'undefined') rsp = true;

      // eslint-disable-next-line consistent-return
      return rsp;
    });
  }

  sendMessage (message) {
    return new Promise(async (resolve, reject) => {
      this._bot.postMessage(this.id, new Message(message), (err, rsp) => {
        if (err) {
          return reject(err);
        }

        return resolve(rsp);
      });
    });
  }
}

module.exports = Channel;
