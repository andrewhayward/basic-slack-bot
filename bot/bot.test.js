const Bot = require('./bot');

describe('Bot', () => {
  it('should fail without a token', () => {
    expect(() => (new Bot())).toThrow('Missing token');
  });

  it('should should not fail with a token', () => {
    expect(() => (new Bot('token'))).not.toThrow('Missing token');
  });
});
