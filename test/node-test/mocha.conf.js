'use strict';
/*global before, after*/

var config = require('../../shared/config'),
    baseUrl = 'http://localhost:' + (process.env.PORT || 9090) + '/api',
    supertest = require('supertest'),
    request = supertest(baseUrl);

var server = require('../../server/snake_server.js');
// create a valid jwt token to be sent with every request

// make request and token objects available
exports.request = request;


before(function (done) {
	done();
});

after(function (done) {
	server = null;
	done();
});