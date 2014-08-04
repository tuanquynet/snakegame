/*  snake_server.js
 *
 *  Multisnake server implementation
 *  Does matchmaking and passes messages between player clients
 *
 *  Dependencies:
 *      ../shared/config.js
 *      ../shared/comm_names.js
 *      ./events.js
 *      ./matchup.js
 */
'use strict';
var co = require('co');
var config = require('../shared/config.js');
var msgs = require('../shared/comm_names.js').msgs;
var params = require('../shared/comm_names.js').params;
var Events = require('../server/events.js');
var Matchup = require('../server/matchup.js').Matchup;

/* a matchup waiting for more players */
var waiting_matchup = new Matchup();

/* all matchups playing */
var playing_matchups = [];

/* maps all sockets to Matchups */
var socket_matchups = {};

// Setup basic express server
var koa = require('koa');
var app = koa();
// var http = require('http');
var server;
var io;
var port = process.env.PORT || 9090;
// var path = require('path');
var _ = require('lodash');

if (process && process.env.NODE_ENV === 'production') {

	config = _.extend({}, config, config.production);
	console.log(' config ' + config.DB_CONFIG.USERNAME);
}

/*middlewares*/
var serve = require('koa-static');
var json = require('koa-json');
var staticCache = require('koa-static-cache');
var users = require('./routes/user')();

app.use(require('koa-trie-router')(app));
app.use(json());
app.use(staticCache('./client/js'));
app.use(staticCache('./client/css'));
app.use(staticCache('./shared'));

app.use(serve('./client'));
app.use(serve('./shared'));


app.route('/api/users/:name')
	.get(function* (next) {
		var name = this.params.name;
		var res = {"status":"success", "message": ""};
		console.log('get user name ' + name);
		var user = yield users.findById(name);

		//console.log('get user name ' + JSON.stringify(user));
		if (user) {
			res.user = user;
			this.body = res;
		} else {
			user = {userName: name, createdDate: new Date()};
			this.body = JSON.stringify({});
		}
		yield next;
	});

app.route('/api/users/:name')
	.post(function* (next) {
		var name = this.params.name;
		var res = {"status":"success", "message": ""};

		console.log('post user name ' + name);
		var user = yield users.findById(name);
		yield next;
		if (!user) {
			console.log('user loaded ');
			user = {userName: name, createdDate: new Date()};
			yield users.addUser(user);
		}
		res.user = user;
		this.body = res;
	})
	.delete(function * (next) {
		var name = this.params.name;
		this.body = yield users.deleteUser(name);
		yield next;
	});

app.route('/api/users')
	.get(function* (next) {
		console.log('get /user');
		var result = yield users.findAll();

		this.body = JSON.stringify(result);
		yield next;
	});

app.route('/api/scores/:top')
	.get(function* (next){
	var top = parseInt(this.params.top, 0);
	var res = {status:"success", scores: []};
	top = top ? top : 10;
	res.scores = yield users.getHighScores(top);
	this.body = res;
	yield next;
});

app.route('/api/scores/add/:user')
	.post(function* (next){
	var userName = this.params.user;
	var res = {status:"success"};

	res.score = yield users.addScore(userName, 1);
	this.body = res;
	yield next;
});

server = require( 'http' ).Server( app.callback() );

io = require('socket.io')(server);

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

io.sockets.on('connection', function(socket) {
	// var address = socket.handshake.address;

	socket.on('disconnect', function(/*data*/) {
		console.log('someone left '+ socket.id);

		var matchup = socket_matchups[socket.id];
		if (matchup) {
			matchup.disconnect(socket, socket.playerNum);
		}
	});

	socket.on(msgs.TURN, function(data) {
		var matchup = socket_matchups[socket.id];
		if (matchup) {
			matchup.turned(socket, data[params.DIR],
				data[params.COORDS], data[params.TICK]);
		}

		Events.ping(socket, data[params.TIME]);
	});

	socket.on(msgs.JOIN, function(data) {
		var userInfo = (data[params.PLAYER_INFO]);
		if (userInfo) {
			userInfo = JSON.parse(userInfo);
			socket.userName = userInfo.userName;
		}
		if (waiting_matchup.isStarted()) {
			waiting_matchup = new Matchup();
		}

		waiting_matchup.addPlayer(socket);
		socket_matchups[socket.id] = waiting_matchup;

		if (waiting_matchup.isFull()) {
			playing_matchups.push(waiting_matchup);
			waiting_matchup = new Matchup();
		}

		Events.ping(socket, data[params.TIME]);
	});

	socket.on(msgs.UPDATE_INFO, function(data) {
		var userInfo = (data[params.PLAYER_INFO]);
		var matchup = socket_matchups[socket.id];
		if (matchup) {
			matchup.updateInfo(userInfo);
		}
		// Events.updateInfo(socket, data[params.PLAYER_INFO]);
	});

	socket.on(msgs.END_GAME, function(data) {
		var matchup = socket_matchups[socket.id];

		if (matchup) {
			for (var i in matchup.playersocks()) {
				var sock = matchup.playersocks()[i];
				delete socket_matchups[sock.id];
			}

			if (matchup) {
				console.log('msgs.END_GAME ' + socket.userName);
				var playerNum = parseInt(data[params.WINNER].split('player_').join(''));
				var finding = _.where(matchup.playersocks(), {playerNum: playerNum});
				if (finding && finding.length) {
					co(function *(userName) {
						yield users.addScore(userName, 1);
					})(finding[0].userName);
				}
				matchup.endGame(data[params.WINNER]);
			}


		}
	});

	socket.on(msgs.NEW_FOOD, function(data) {
		var matchup = socket_matchups[socket.id];
		if (matchup) {
			matchup.broadcastFood(data[params.X], data[params.Y], data[params.PLAYER_NUM], data[params.PLAYER_SNAKE_LENGTH]);
		}
	});
});

module.exports = app;