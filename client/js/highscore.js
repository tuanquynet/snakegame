/*global jQuery, _, Services, config, Snake, io, msgs, params */

'use strict';
(function ($, _) {
	function HighScore (el) {
		var _scores;
		var $el;
		var template = '';
		var duration = 3000;
		
		$el = $(el);

		this.initialize = function () {
			this.loadTemplate();
			//this.loadHighScore();
		};

		this.loadHighScore = function () {
			var url = Services.HIGH_SCORE.split(':top').join(10);
			var self = this;
			$.get(url, {}, function (data) {
				self.update(data.scores);
				setTimeout(_.bind(self.loadHighScore, self), duration);
			}).fail(function() {
				setTimeout(_.bind(self.loadHighScore, self), duration);
			});
		};

		this.loadTemplate = function () {
			$.get('js/templates/highscore.tmpl', {}, _.bind(this._onSuccessTemplate, this)).fail(_.bind(this._onErrorTemplate, this));
		};

		this._onSuccessTemplate = function (data) {
			template = data;
			this.loadHighScore();
		};

		this._onErrorTemplate = function () {

		};

		this.update = function (scores) {
			_scores = scores;
			this.render();
		};

		this.render = function () {
			if (!template) {
				this.loadTemplate();
			} else {
				var content = _.template(template, {scores: _scores});
				$el.html(content);
			}
		};

		this.remove = function () {

		};

		this.initialize();
	}
	window.HighScore = HighScore;
})(jQuery, _);
