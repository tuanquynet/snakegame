/*  comm_names.js
 *
 *  The names of messages to be used in multisnake client-server communication
 *
 *
 *
 *  Dependencies:
 *      ./cs_module.js
 */
'use strict';

if (typeof (require) !== 'undefined') {
	var clientServerModule = require('./cs_module.js').clientServerModule;
}

var msgs = {
	'END_GAME': 'end',
	'START_GAME': 'start',
	'JOIN': 'join',
	'TURN': 'turn',
	'OPPONENT_TURN': 'op_turn',
	'NEW_FOOD': 'food',
	'PING': 'ping',
	'DISCONNECT': '_disconnect',
	'UPDATE_INFO': 'update_info'
};

var params = {
	'PLAYER_NUM': 'pnum',
	'TIME': 'time',
	'DIR': 'dir',
	'COORDS': 'coords',
	'FAIL_PLAYERS': 'fail_players',
	'TICK': 'tick',
	'X': 'x',
	'Y': 'y',
	'WINNER': 'winner',
	'NUM_OF_PLAYER': 'num_of_player',
	'PLAYER_SNAKE_LENGTH': 'player_snake_length',
	"PLAYER_INFO": 'player_info',
	'PLAYERS': 'players'
};

clientServerModule({
	params: params,
	msgs: msgs
}, typeof (exports) !== 'undefined' ? exports : 0);

var Services = {
	GET_USER: 'api/users/:username',
	ADD_USER: 'api/users/:username',
	REMOVE_USER: 'api/users/:username',
	HIGH_SCORE: 'api/scores/:top'
};