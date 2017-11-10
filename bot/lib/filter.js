const Model = require('../models/model');

function normalizeItem (item) {
  switch (typeof item) {
    case 'undefined': {
      return true;
    }

    case 'function':
    case 'boolean': {
      return item;
    }

    case 'number':
    case 'string': {
      return new RegExp(item, 'i');
    }

    default:
      // see below
  }

  if (item === null) return false;

  if (item instanceof RegExp) return item;

  if (Array.isArray(item)) {
    return item.map(i => normalizeItem(i));
  }

  return Object.entries(item).reduce((obj, [key, value]) => {
    if (Array.isArray(value)) {
      // eslint-disable-next-line no-param-reassign
      obj[key] = value.map(i => normalizeItem(i));
    } else {
      // eslint-disable-next-line no-param-reassign
      obj[key] = [normalizeItem(value)];
    }
    return obj;
  }, {});
}

function normalize (input) {
  switch (typeof input) {
    case 'undefined': {
      return [true];
    }

    case 'function':
    case 'boolean': {
      return [input];
    }

    case 'number':
    case 'string': {
      return [{ text: [normalizeItem(input)] }];
    }

    default:
      // see below
  }

  if (input === null) return [true];
  if (input instanceof RegExp) return [{ text: [normalizeItem(input)] }];

  if (Array.isArray(input)) {
    return input.map(item => normalize(item).pop());
  }

  return [normalizeItem(input)];
}

function test (suite, content, key) {
  return suite.some(suiteItem => (
    (Array.isArray(content) ? content : [content]).some((contentItem) => {
      if (typeof suiteItem === 'boolean') {
        return suiteItem === !!contentItem;
      }

      if (typeof suiteItem === 'function') {
        return suiteItem(contentItem, key);
      }

      if (suiteItem instanceof RegExp) {
        return suiteItem.test(contentItem);
      }

      return Object.entries(suiteItem).every(([k, v]) => test(v, contentItem[k], k));
    })
  ));
}

class Filter {
  constructor (config) {
    if (config instanceof Model) {
      // eslint-disable-next-line no-param-reassign
      config = config.toFilter();
    }

    this.suite = normalize(config);
  }

  test (message) {
    return test(this.suite, message);
  }
}

module.exports = Filter;
