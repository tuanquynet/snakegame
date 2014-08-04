'use strict';
/*global describe, it, xit*/
/* mocha specs for users controller go here */

var mochaConf = require('./mocha.conf'),
	request = mochaConf.request;

var userExisting = false;
describe('Asynchronous test users api', function () {
	describe('users api', function () {

		it('Get /users/test100 should create a new user', function () {
			request
				.get('/users')
				.expect(200)
				.end(function () {
					userExisting = true;
					console.log('callback userExisting ' + userExisting);
				});
		});

		it('Delete /users/test1000 if exist',  function () {
			console.log('Delete userExisting ' + userExisting);
			if (userExisting) {
				request
				.delete('/users/test100')
				.expect(200)
				.end(function(error) {
					console.log('error ' + error);
				});
			}

		});

		it('Post /users/test100 should create a new user', function (done) {
			request
				.post('/users/test100')
				.send({name: 'test100', email: 'test100@koanjs.com'})
				.expect(200, done);
		});

	});
});