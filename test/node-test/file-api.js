'use strict';
/*global describe, it, xit*/
var fs = require('fs');
var should = require('should');

module.exports.loadAPIRoutes = function loadAPIRoutes(path) {
	var apiPath = path;//'./server/routes/api';

	var existing = fs.existsSync(apiPath);

	console.log('process.env ' + JSON.stringify(process.env));
	if (existing) {
		var stats = fs.statSync(apiPath);
		if (stats.isDirectory()) {
			console.log('load directory ' + apiPath);
			fs.readdirSync(apiPath).forEach(function (file) {
				//console.log('load file ' + (apiPath + '/' + file.toString()));
				loadAPIRoutes(apiPath + '/' + file.toString());
			});

			return true;
		} else if (stats.isFile()) {
			console.log('load file with path ' + process.cwd() + '/' + apiPath);
			var loaded = require(process.cwd() + '/' + apiPath);
			//loaded.init();
		}

	}
	return true;
};

/* mocha specs for users controller go here */

/*var mochaConf = require('./mocha.conf'),
	request = mochaConf.request;*/

describe('Asynchronous test api', function () {
	describe('file api', function () {

		it('loadAPIRoutes', function () {
			should(module.exports.loadAPIRoutes('./server/routes')).be.exactly(true);
		});

	});
});