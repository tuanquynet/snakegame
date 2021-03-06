/*  utils.js
 *
 *
 */

if (typeof (require) !== 'undefined')
	var clientServerModule = require('./cs_module.js').clientServerModule;


function data() {
	var ret = {};
	for (var i = 0; i < arguments.length / 2; i++)
		ret[arguments[2 * i]] = arguments[2 * i + 1];

	return ret;
}

/* copied from Google closure library */
function inherits(childCtor, parentCtor) {
	function tempCtor() {}
	tempCtor.prototype = parentCtor.prototype;
	childCtor.superClass_ = parentCtor.prototype;
	childCtor.prototype = new tempCtor();
	childCtor.prototype.constructor = childCtor;
}

clientServerModule({
	data: data
}, typeof (exports) !== 'undefined' ? exports : 0);

var ColorUtil = (function () {
	var TableColor = [];

	function generateColor() {
		var color;
		do {
			color = '#' + (Math.random() * 0xFFFFFF << 0).toString(16);
		} while (TableColor.indexOf(color) >= 0);
		TableColor.push(color);
		return color;
	}
	return {
		generateColor: generateColor
	};
})();