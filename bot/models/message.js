const Attachment = require('./attachment');
const Model = require('./model');

class Message extends Model {
  constructor (meta, bot) {
    if (/string|number/.test(typeof meta)) {
      // eslint-disable-next-line no-param-reassign
      meta = { text: meta };
    }

    if (Object.prototype.hasOwnProperty.call(meta, 'attachments')) {
      meta.attachments = meta.attachments.map(attachment => new Attachment(attachment));
    }

    super(meta, bot);
  }

  get id () {
    return this.ts;
  }

  reply (msg) {
    return new Promise(async (resolve, reject) => {
      const message = new Message(msg);
      message.thread_ts = this.thread_ts;

      this._bot.postMessage(this.channel.id, message, (err, rsp) => {
        if (err) {
          return reject(err);
        }

        return resolve(rsp);
      });
    });
  }

  replyInThread (msg) {
    return new Promise(async (resolve, reject) => {
      const message = new Message(msg);
      message.thread_ts = this.thread_ts || this.ts;

      this._bot.postMessage(this.channel.id, message, (err, rsp) => {
        if (err) {
          return reject(err);
        }

        return resolve(rsp);
      });
    });
  }
}

Message.create = function createMessage (msg, bot) {
  if (!msg) return Promise.reject(new Error('No message supplied'));

  if (/string|number/.test(typeof msg)) {
    // eslint-disable-next-line no-param-reassign
    msg = { text: msg };
  }

  return new Promise((resolve, reject) => {
    Promise.all([
      msg.channel ? bot.getChannelById(msg.channel) : Promise.resolve(),
      msg.channel ? bot.getDMById(msg.channel) : Promise.resolve(),
      msg.user ? bot.getUserById(msg.user) : Promise.resolve()
    ]).then(([channel, dm, user]) => {
      msg.channel = channel || dm;

      if (msg.user) msg.user = user;

      resolve(new Message(msg, bot));
    });
  });
};

module.exports = Message;
