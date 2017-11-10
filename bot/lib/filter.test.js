const Filter = require('./filter');

function testFilter (filter, message) {
  return filter.test(message);
}

describe('Filter', () => {
  it('should pass when `undefined`', () => {
    const filter = new Filter(undefined);
    expect(testFilter(filter, { })).toBe(true);
    expect(testFilter(filter, { text: 'abc' })).toBe(true);
    expect(testFilter(filter, { attachments: [] })).toBe(true);
  });

  it('should pass when `null`', () => {
    const filter = new Filter(null);
    expect(testFilter(filter, { })).toBe(true);
    expect(testFilter(filter, { text: 'abc' })).toBe(true);
    expect(testFilter(filter, { attachments: [] })).toBe(true);
  });

  it('should pass when `true`', () => {
    const filter = new Filter(true);
    expect(testFilter(filter, { })).toBe(true);
    expect(testFilter(filter, { text: 'abc' })).toBe(true);
    expect(testFilter(filter, { attachments: [] })).toBe(true);
  });

  it('should not pass when `false`', () => {
    const filter = new Filter(false);
    expect(testFilter(filter, { })).toBe(false);
    expect(testFilter(filter, { text: 'abc' })).toBe(false);
    expect(testFilter(filter, { attachments: [] })).toBe(false);
  });

  it('should pass when passed a string matching text', () => {
    const filter = new Filter('abc');
    expect(testFilter(filter, { text: 'abc' })).toBe(true);
    expect(testFilter(filter, { text: '...abc123' })).toBe(true);
  });

  it('should not pass when passed a string not matching text', () => {
    const filter = new Filter('abc');
    expect(testFilter(filter, { text: '123' })).toBe(false);
    expect(testFilter(filter, { attachments: [] })).toBe(false);
  });

  it('should pass when passed a number matching text', () => {
    const filter = new Filter(123);
    expect(testFilter(filter, { text: '123' })).toBe(true);
    expect(testFilter(filter, { text: '...abc123' })).toBe(true);
  });

  it('should not pass when passed a number not matching text', () => {
    const filter = new Filter(123);
    expect(testFilter(filter, { text: 'abc' })).toBe(false);
    expect(testFilter(filter, { attachments: [] })).toBe(false);
  });

  it('should pass when passed a regex matching text', () => {
    const filter = new Filter(/ab?c/);
    expect(testFilter(filter, { text: 'abc' })).toBe(true);
    expect(testFilter(filter, { text: '...abc123' })).toBe(true);
  });

  it('should not pass when passed a regex not matching text', () => {
    const filter = new Filter(/ab?c/);
    expect(testFilter(filter, { text: '123' })).toBe(false);
    expect(testFilter(filter, { attachments: [] })).toBe(false);
  });

  it('should pass when passed a complex object matching existence', () => {
    const filter = new Filter({ text: true });
    expect(testFilter(filter, { text: 'abc' })).toBe(true);
  });

  it('should not pass when passed a complex object not matching existence', () => {
    const filter = new Filter({ text: true });
    expect(testFilter(filter, { attachments: [] })).toBe(false);
  });

  it('should pass when passed a complex object matching values', () => {
    const filter = new Filter({ text: 'abc' });
    expect(testFilter(filter, { text: 'abc' })).toBe(true);
  });

  it('should pass when nested suites match', () => {
    const filter = new Filter({ attachments: { text: 'abc' } });
    expect(testFilter(filter, { attachments: [{ text: 'abc' }] })).toBe(true);
  });
});
