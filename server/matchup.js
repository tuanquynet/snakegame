/*  matchup.js
 *
 *  A multisnake game between 2 players
 *
 *  Dependencies:
 *      ./events.js
 *      ../shared/config.js
 */
'use strict';

var config = require('../shared/config.js');
var Events = require('../server/events.js');

var Matchup = function () {
	/* the players involved in this matchup */
	var playersocks = [];

	/* is the game running? */
	var gameRunning = false;

	/* 2 players allowed */
	// var capacity = config.MAX_NUM_PLAYER;

	var id = (new Date()).getTime();

	return {
		getId: function() {
			return id;
		},
		/* Add a player to this matchup. Game starts if full after adding the player.
           Error thrown if already full. */
		addPlayer: function (socket) {
			if (this.isFull() || gameRunning) {
				throw "Matchup is already full";
			}

			playersocks.push(socket);

			clearTimeout(this.startGameTimeout);

			if (this.isFull()) {
				this.startGame();
			} else if (this.isReadyForStartingGame()) {
				var self = this;

				this.startGameTimeout = setTimeout(function() {
					self.startGame();
				}, config.WAITING_TIME);
			}

			console.log('added player- there are now ' + playersocks.length +
				' players in this match');

		},

		isStarted: function () {
			return gameRunning;
		},

		isReadyForStartingGame: function () {
			return playersocks.length >= config.MINIMUM_PLAYER;
		},

		isFull: function () {
			return playersocks.length === config.MAX_NUM_PLAYER;
		},

		turned: function (socket, dir, coords, tick) {
			console.log('sending turn');
			// send the turn to all sockets except the sender
			// for (var i = 0; i < playersocks.length; i++) {
			playersocks.forEach(function (s) {
				// var s = playersocks[i];
				if (s !== socket) {
					Events.opponent_turned(s, dir, coords, tick, playersocks.indexOf(socket));
				}
			});
		},

		// Sends the game_end signal to all players
		endGame: function (fail_players) {
			console.log('Ending game');
			if (gameRunning) {
				gameRunning = false;
				playersocks.forEach(function (s) {
					Events.end(s, fail_players);
				});
				playersocks = [];
			}
		},

		startGame: function () {
			var food = getInitialFood();
			var numOfPlayer = playersocks.length;
			var players = [];

			gameRunning = true;
			playersocks.forEach(function (s) {
				players.push({userName: s.userName});
			});
			players = JSON.stringify(players);
			console.log('playersocks: ' + playersocks.length);
			console.log('players: ' + players);
			for (var i = 0; i < numOfPlayer; i++) {
				var s = playersocks[i];
				s.playerNum = i;
				Events.start(s, i, food[0], food[1], players);
			}
		},

		updateInfo: function (socket, userInfo) {
			userInfo = typeof userInfo === 'string' ? JSON.parse(userInfo) : userInfo;
			socket.userName = userInfo.userName;
			userInfo.playerNum = socket.playerNum;

			userInfo = JSON.stringify(userInfo);
			playersocks.forEach(function (s) {
				console.log('emit updateInfo ' + userInfo);
				if (s.id !== socket.id) {
					//Events.updateInfo(s, userInfo);
				}
			});
		},

		broadcastFood: function (x, y) {
			if (gameRunning) {
				playersocks.forEach(function (s) {
					Events.newFood(s, x, y);
				});
			}
		},

		// If someone disconnects, and if the game is running, remove that socket and send the
		// disconnected message to all other players
		disconnect: function (socket, playerNum) {
			if (gameRunning) {
				var i = playersocks.indexOf(socket);
				delete playersocks[i];
				// playersocks.splice(i, 1);
				console.log('len before ' + playersocks.length + ' num ' + playerNum);
				playersocks.forEach(function (s) {
					console.log('emit disconnect ' + s.playerNum);
					Events.disconnect(s, playerNum);
				});
			}
		},

		playersocks: function () {
			return playersocks;
		}
	};
};

/* generate a food object to start the game by putting it between START_X and the right edge.
 * hopefully simpler than generating it on the client and adding another condition before game
   start? */
function getInitialFood() {
	var x = Math.floor(Math.random() * (config.XSIZE));

	// don't put the initial food in the same row as a snake
	var y;
	do {
		y = Math.floor(Math.random() * config.YSIZE);
	} while (y === config.YSTART0 || y === config.YSTART1);

	return [x, y];
}

exports.Matchup = Matchup;