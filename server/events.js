/*  events.js
 *
 *  Events sent and handled by the server
 *
 *  Dependencies:
 *      ./comm_names.js
 *      ./utils.js
 */
/*global Events*/
'use strict';

var msgs = require('../shared/comm_names.js').msgs;
var params = require('../shared/comm_names.js').params;
var data = require('../shared/utils.js').data;

/*
 *  Sent events
 */

var Events = module.exports = {};

Events.opponent_turned = function (socket, dir, coords, tick, turnedPlayerNum) {
	socket.emit(msgs.OPPONENT_TURN, data(params.DIR, dir,
			params.COORDS, coords,
			params.PLAYER_NUM, turnedPlayerNum),
		params.TICK, tick);
};

Events.disconnect = function (socket, playerNum) {
	socket.emit(msgs.DISCONNECT, data(params.PLAYER_NUM, playerNum));
};

Events.start = function (socket, playerNum, foodX, foodY, players) {
	socket.emit(msgs.START_GAME, data(params.PLAYER_NUM, playerNum,
		params.X, foodX,
		params.Y, foodY,
		params.PLAYERS, players));
};

Events.end = function (socket, winner) {
	socket.emit(msgs.END_GAME, data(params.WINNER, winner));
};

Events.newFood = function (socket, x, y, playerNum, len) {
	socket.emit(msgs.NEW_FOOD, data(params.X, x,
		params.Y, y, params.PLAYER_NUM, playerNum, params.PLAYER_SNAKE_LENGTH, len));
};

Events.ping = function (socket, time) {
	socket.emit(msgs.PING, data(params.TIME, time));
};

Events.updateInfo = function (socket, userInfo) {
	socket.emit(msgs.UPDATE_INFO, data(params.PLAYER_INFO, userInfo));
};