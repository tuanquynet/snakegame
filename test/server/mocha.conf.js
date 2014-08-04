'use strict';
/*global before, after*/
/*var msgs = require('../shared/comm_names.js').msgs;
var params = require('../shared/comm_names.js').params;
var Events = require('../server/events.js');*/
var config = require('../../shared/config'),
    baseUrl = 'http://localhost:' + (process.env.PORT || 9090) + '/api',
    supertest = require('supertest'),
    request = supertest(baseUrl);

var server = require('../../server/snake_server.js');
// create a valid jwt token to be sent with every request

// make request and token objects available
exports.request = request;

// initiate KOAN server before each test is run
// also drop and re-seed the test database before each run
console.log('Mocha starting to run server tests on port ' + config.PORT);

before(function (done) {
	done();
});

after(function (done) {
	server = null;
	done();
});