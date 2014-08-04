'use strict';
/*global describe, it*/
/* mocha specs for public controller go here */

var mochaConf = require('./mocha.conf'),
    request = mochaConf.request;

describe('Public controller', function () {
  it('Load scores', function (done) {
    request
        .get('/scores/10')
        .expect(200, done);
  });
});
