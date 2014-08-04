/*  snakegame.js
 *
 *  Client-side multisnake game logic
 *
 *  Dependencies:
 *      ./gridbox.js
 *      ./events.js
 *      ../shared/config.js
 *      ../shared/comm_names.js
 *      ./snake.js
 *
 */
/*global Services, config, Snake, io, msgs, params, EventsF, HighScore, Foodbox, Gridbox */
'use strict';
var Events;
var server = null;
// var MAX_NUM_PLAYER = config.MAX_NUM_PLAYER;
var highScore;

$(document).ready(function () {
	if (!server) {
		server = {};
		server.url = window.location.protocol + '//' + window.location.hostname;
		server.port = window.location.port;
	}

	// alert(server.url);
	sock_setup();
	Board.setup();

	function getUser(userName, success, error) {
		var data = {
			method: 'GET'
		};
		var url = Services.GET_USER.replace(':username', userName);
		$.get(url, data, success).fail(error);
	}

	function addUser(userName, success, error) {
		var data = {
			method: 'POST'
		};
		var url = Services.ADD_USER.replace(':username', userName);
		//post call to http://host/user/username
		$.post(url, data, success).fail(error);
	}
	// set the join game button action
	// $('#join_button').click(function (e) {
	$('#register').on('submit', function (e) {
		e.stopPropagation();
		e.preventDefault();
		if (!e.currentTarget.checkValidity()) {
			return;
		}
		var success = function (data) {
			// data = JSON.parse(data);
			if (data && !$.isEmptyObject(data.user)) {
				joinGame(data.user.userName);
			} else {
				// console.log('joinGame');
				addUser($('#user-name').val(), function (data) {
					if (data && !$.isEmptyObject(data.user)) {
						joinGame(data.user.userName);
					}
				},
				function () {

				});
			}
		};

		var error = function () {
			alert('There is some error occured.');
		};

		getUser($('#user-name').val(), success, error);
	});

	highScore = new HighScore($('.high-score-container'));
	$(document).keyup(Game.keyListener);
});

var Game = (function () {
	/* the game's snake objects */
	var snakes;

	/* the index of snakes which this player controls */
	var playerNum;

	/* the food object */
	var food;

	/* records whether a game is running */
	var gameRunning = false;

	/* the ID of the game loop interval */
	var intervalID;

	/* the current game tick number, incremented each run of the game loop */
	var curTick = 0;

	function addSnake(yStart, color, id, userName) {
		// snakes.push(new Snake(config.XSTART, yStart, color, Game, id));
		var snake = new Snake(config.XSTART, yStart, color, Game, id);
		snake.userName = userName;
		snakes[id.toString()] = snake;
	}

	function removeSnake(playerNum) {
		console.log('removeSnake ' + playerNum);
		// snakes.splice(parseInt(playerNum, 0), 1);
		Board.removeDrawable(snakes[playerNum]);
		delete snakes[playerNum];
	}
	/* returns a new randomly placed food location which is not under the snake */
	function getNewFood() {
		var snake = snakes[playerNum];
		var x = Math.floor(Math.random() * config.XSIZE);
		var y = Math.floor(Math.random() * config.YSIZE);

		while (snake.coversPoint(new Gridbox(x, y))) {
			x = Math.floor(Math.random() * config.XSIZE);
			y = Math.floor(Math.random() * config.YSIZE);
		}

		return new Foodbox(x, y);
	}


	return {
		startGame: function (assignedPlayerNum, food_x, food_y, users) {
			this.initGame(assignedPlayerNum, food_x, food_y, users);
			this.preGame(config.COUNTDOWN_DURATION);
		},

		/* called each second until game starts */
		preGame: function (timeLeft) {
			if (timeLeft > 0) {
				$('#info_text').html(config.PREGAME_TEXT + timeLeft + '...');
				var that = this;
				setTimeout(function () {
					that.preGame(timeLeft - 1);
				}, 1000);
			} else {
				$('#info_text').css('visibility', 'hidden');
				gameRunning = true;
				intervalID = setInterval(globalLoop, 100 / config.SPEED);
				updateScore();
			}
		},

		/* init the gameboard game start */
		initGame: function (assignedPlayerNum, food_x, food_y, users) {
			users = typeof users === 'string' ? JSON.parse(users) : users;
			var numberOfPlayer = users.length;
			console.log('initting game ' + numberOfPlayer);
			playerNum = assignedPlayerNum;
			snakes = [];

			var colors = [
				"rgb(0,150,0)",
				"rgb(200,0,0)",
				"rgb(200,100,0)",
				"rgb(135,124,166)",
				"rgb(154,65,57)",
				"rgb(0,150,0)",
				"rgb(200,0,0)",
				"rgb(200,100,0)",
				"rgb(135,124,166)",
				"rgb(154,65,57)"
			];
			var yPos = 3;
			for (var i = numberOfPlayer - 1; i >= 0; i--) {
				addSnake(yPos, colors[i], i, users[i].userName);
				yPos += 5;
			}

			Board.reset();
			this.newFood(food_x, food_y);
			Board.addDrawables(snakes);
			Board.draw();
		},

		opponentTurn: function (turnedPlayerNum, dir, coords, tick) {
			var snake = snakes[turnedPlayerNum];
			snake.compensate(coords, tick);
			snake.doTurn(dir);
		},

		newFood: function (x, y, playerNum) {
			Board.removeDrawable(food);
			food = new Foodbox(x, y);
			Board.addDrawable(food);
			console.log('newFood ' + playerNum);
			if (snakes[playerNum]) {
				snakes[playerNum].increaseSize(1);
				snakes[playerNum].score += config.SCORE_DELTA;
			}

		},

		endGame: function (winner) {
			clearInterval(intervalID);
			if (gameRunning) {
				console.log('Received game_end command but did not detect game end');
			}

			console.log('endgame: winner ' + winner + ' playerNum ' + playerNum);
			//show winner
			var playerId = 'player_' + playerNum;
			if (playerId === winner) {
				alert(config.WINMSG);
			} else {
				alert(config.FAILMSG);
			}

			$('#join_button').removeAttr('disabled');
		},

		disconnect: function (player) {
			if (gameRunning) {
				console.log(config.DISCONNECTMSG + ' ' + player);
			}
			removeSnake(player);
			// gameRunning = false;
		},

		playerScore: function () {
			console.log('playerNum ' + playerNum);
			return snakes[playerNum].score;
		},

		player: function () {
			return snakes[playerNum];
		},

		otherPlayers: function () {
			var otherSnakes = [];
			for (var i in snakes) {
				if (i !== playerNum.toString()) {
					otherSnakes.push(snakes[i]);
				}
			}
			return otherSnakes;
		},

		update: function () {
			for (var i in snakes) {
				snakes[i].update(food, curTick);
			}
		},

		/* main game loop */
		loop: function () {

			this.update();
			Board.draw();
			var snake;
			var winner = this.checkWinner();
			if (!!winner) {
				gameRunning = false;
				Events.end(winner);
			}
			// make new food, if needed
			if (food) {
				snake = snakes[playerNum];
				if (snake.gotFood(food)) {
					Board.removeDrawable(food);
					food = null;
					Events.newFood(getNewFood(), playerNum, snake.length() + 1);
				}
				// }
			}
			updateScore();
			curTick++;
		},

		checkWinner: function () {
			var snake;
			for (var i in snakes) {
				snake = snakes[i];
				if (snake.length() === config.GAME_TARGET) {
					return 'player_' + snake.playerId;
				}
			}

			return false;
		},

		curTick: function () {
			return curTick;
		},

		food: function () {
			return food;
		},

		/* keyup listener */
		keyListener: function (e) {
			if (gameRunning) {
				var snake = snakes[playerNum];
				var turnCode = {
					37: 'l',
					38: 'u',
					39: 'r',
					40: 'd'
				}[e.keyCode];
				if (snake.doTurn(turnCode)) {
					Events.turn(snake.dir, [snake.head.x(), snake.head.y()], curTick);
				}
			} else {
				console.log('keypress ignored: playerNum not yet assigned');
			}
		},

		/* debug purposes only */
		snakes: function () {
			return snakes;
		}
	};
})();


var Board = (function () {

	/* the gameboard context */
	var ctx;

	/* things with a draw() method that will be drawn on this board */
	var drawables = [];

	return {
		addDrawable: function (drawable) {
			drawables.push(drawable);
		},

		removeDrawable: function (drawable) {
			var i = drawables.indexOf(drawable);
			delete drawables[i];
		},

		addDrawables: function (drawableArray) {
			for (var i in drawableArray) {
				this.addDrawable(drawableArray[i]);
			}
		},

		draw: function () {
			this.clear();
			drawables.forEach(function (drawable) {
				drawable.draw(ctx);
			});
		},

		setup: function () {
			ctx = $('#gameboard')[0].getContext('2d');

			// ctx.canvas doesn't know it's size unless set here or directly on the element,
			// for some reason
			// css has no effect- whatever. set wrapper width here so those numbers are in one place
			ctx.canvas.setAttribute('width', config.WIDTH);
			ctx.canvas.setAttribute('height', config.HEIGHT);
			$('#wrapper').width(config.WIDTH);
		},

		clear: function () {
			ctx.clearRect(0, 0,
				config.XSIZE * (config.GRID_SIZE + config.GRID_PAD) +
				config.GRID_PAD,

				config.YSIZE * (config.GRID_SIZE + config.GRID_PAD) +
				config.GRID_PAD);
		},

		reset: function () {
			this.clear();
			drawables = [];
		}
	};
})();

/* update the score <span> */
function updateScore() {
	var otherPlayerScore = '';
	var otherPlayers = Game.otherPlayers();
	var player;

	$('#player_num').hide();
	$('#player_score').html(Game.playerScore());
	for (var i = 0; i < otherPlayers.length; i++) {
		player = otherPlayers[i];
		otherPlayerScore += 'Player ' + (player.userName ? player.userName : player.playerId) + ': ' + player.score + '<br/ >';
	}
	$('#opponent_score').html(otherPlayerScore);
}

/* update the latency <span> */
function updateLatency(latency) {
	$('#latency').html(latency);
	var color;

	if (latency < 50) {
		color = 'rgb(0, 200, 0)';
	} else if (latency < 150) {
		color = 'rgb(242, 214, 0)';
	} else {
		color = 'rgb(200, 0, 0)';
	}
	$('#latency').css('color', color);
}

function joinGame(userName) {
	$('#join_button').attr('disabled', 'disabled');
	if (Events) {
		$('#info_text').html('Searching for opponent...');
		$('#info_text').css('visibility', 'visible');
		var userInfo = {userName: userName};
		userInfo = JSON.stringify(userInfo);
		Events.join(userInfo);

	} else {
		console.log('Waiting for socket to connect');
		setTimeout(function () {
			joinGame(userName);
		}, 500);
	}
}


function sock_setup() {
	console.log('connecting...');
	var socket = io.connect(server.url + ":" + server.port);

	socket.on('connect', function () {
		console.log('connected');
		$('#info_text').css('visibility', 'hidden');
		$('#join_button').removeAttr('disabled');
		Events = new EventsF(socket);

		socket.on(msgs.OPPONENT_TURN, function (data) {
			console.log('my opponent turned ' + data[params.DIR] + '!');
			Game.opponentTurn(data[params.PLAYER_NUM], data[params.DIR], data[params.COORDS], data[params.TICK]);
		});

		socket.on(msgs.START_GAME, function (data) {
			console.log('starting game');
			Game.startGame(data[params.PLAYER_NUM], data[params.X], data[params.Y], data[params.PLAYERS]);
		});

		socket.on(msgs.END_GAME, function (data) {
			console.log('Received game end command');
			Game.endGame(data[params.WINNER]);
		});

		socket.on(msgs.NEW_FOOD, function (data) {
			console.log('Received new food');
			Game.newFood(data[params.X], data[params.Y]);
		});

		socket.on(msgs.UPDATE_INFO, function (data) {
			console.log('Received new food');
			Game.updateInfo(data[params.X], data[params.Y]);
		});

		socket.on(msgs.PING, function (data) {
			var latency = new Date().valueOf() - data[params.TIME];
			updateLatency(latency);
		});

		socket.on(msgs.DISCONNECT, function (data) {
			Game.disconnect(data[params.PLAYER_NUM]);
		});
	});
}

/* js is confusing sometimes */
function globalLoop() {
	Game.loop();
}