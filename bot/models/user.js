const Message = require('./message');
const Model = require('./model');

class User extends Model {
  sendMessage (message) {
    return new Promise(async (resolve, reject) => {
      const dm = await this._bot.getDMByUserId(this.id);

      this._bot.postMessage(dm.id, new Message(message), (err, rsp) => {
        if (err) {
          return reject(err);
        }

        return resolve(rsp);
      });
    });
  }
}

module.exports = User;
