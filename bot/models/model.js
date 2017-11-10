class Model {
  constructor (meta, bot) {
    if (meta instanceof this.constructor) {
      return meta;
    }

    if (meta._instance && meta._instance instanceof this.constructor) {
      return meta._instance;
    }

    Object.defineProperty(this, '_bot', {
      value: bot
    });

    const properties = Object.keys(meta._properties || meta);

    properties.forEach((property) => {
      if (property.startsWith('_')) return;

      Object.defineProperty(this, property, {
        enumerable: true,
        get: () => meta[property]
      });
    });
  }

  toFilter () {
    const modelType = this.constructor.name.toLowerCase();
    return { [modelType]: { id: this.id } };
  }
}

module.exports = Model;
