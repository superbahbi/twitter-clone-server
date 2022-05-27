const expect = require('chai').expect
const server = require('../app');

describe('test', () => {
  it('should return a string', () => {
    expect('test result').to.equal('test result');
  });
});
