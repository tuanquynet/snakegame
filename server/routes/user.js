'use strict';

var config = require('../../shared/config.js');
var co = require('co');
var comongo = require('co-mongo');
var db;
var env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';
comongo.configure({
	host: config[env].DB_CONFIG.SERVER,
	port: config[env].DB_CONFIG.PORT,
	name: config[env].DB_CONFIG.DB_NAME,
	pool: 10,
	collections: ['users', 'scores']
});

co(function *() {
	db = yield comongo.get();
	var result = true;
	console.log(' config ' + config[env].DB_CONFIG.USERNAME);
	if (config[env].DB_CONFIG.USERNAME !== '') {
		console.log('authorizing');
		result = yield db.authenticate(config[env].DB_CONFIG.USERNAME, config[env].DB_CONFIG.PASSWORD);
	}

	if (!result) {
		console.log('Not authorized to connect to database ' + result);
		throw('Not authorized to connect to database');
	}
	//console.log('collection ' + db);
	// Collections attached to db object
	var collection = yield db.collection('users');
	console.log('authorizing result ' + result + ' ' + collection);
	// var data = yield collection.find().toArray();
})();

module.exports = function() {
	var _prototype = {};
	_prototype.findById = function *(id) {
		console.log('Retrieving : ' + id);
		var collection = yield db.collection('users');
		var data = yield collection.findOne({'userName': id});
		console.log('findOne : ' + data);
		return data;
	};

	_prototype.findAll = function *() {
		var collection = yield db.collection('users');
		var data = yield collection.find().toArray();
		return yield data;
	};

	_prototype.addUser = function *(user) {
		var collection = yield db.collection('users');
		yield collection.insert(user);
		return user;
	};
/*
	_prototype.updateUser = function *(id, user) {
		//yield;
	};
*/
	_prototype.deleteUser = function *(id) {
		console.log('remove ' + id);
		var collection = yield db.collection('users');
		var data = yield collection.findOne({'userName': id});
		yield collection.remove(data);
		return data;
	};

	_prototype.addScore = function *(id, value) {
		var collection = yield db.collection('scores');
		var score = yield collection.findOne({'userName': id});
		var inserts;

		if (!score) {
			inserts = yield collection.insert({userName: id, count: 0});
			score = inserts[0];
		}
		score.count += value;
		console.log('addScore update ' + JSON.stringify(score));
		yield collection.update({'userName': id}, score);

		return score;
	};

	_prototype.getHighScores = function *(top) {
		var collection = yield db.collection('scores');
		var options = {
			"limit": top,
			"sort": [['count','desc']]
		};
		var scores = yield collection.find({}, options).toArray();

		return scores;
	};

	return _prototype;
};

