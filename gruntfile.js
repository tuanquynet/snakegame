'use strict';

// var fs = require('fs');

module.exports = function (grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		env: {
			test: {
				NODE_ENV: 'test',
				PORT: '9090'
			},
			dev: {
				NDOE_ENV: 'development',
				PORT: '9090'
			},
			production: {
				NODE_ENV: 'production',
			}
		},
		concurrent: {
			dev: {
				tasks: ['nodemon:dev'],
				options: {
					logConcurrentOutput: true
				}
			},
			test: {
				tasks: ['nodemon:dev','mochacli:server'],
				options: {
					logConcurrentOutput: true
				}
			},
			production: {
				tasks: ['nodemon:dev'],
				options: {
					logConcurrentOutput: true
				}
			}
		},
		karma: {
			unit: {
				configFile: 'test/client/karma.conf.js'
			},
			handy_unit: {
				configFile: 'handy-test/client/karma.conf.js'
			}

		},
		nodemon: {
			dev: {
				script: 'server/snake_server.js',
				options: {
					nodeArgs: ['--debug', '--harmony'],

					// omit this property if you aren't serving HTML files and
					// don't want to open a browser tab on start
					callback: function (nodemon) {
						nodemon.on('log', function (event) {
							console.log(event.colour);
						});

						// opens browser on initial server start
						nodemon.on('config:update', function () {
							console.log('config:update');
						});

						// refreshes browser when server reboots
						nodemon.on('restart', function () {
							// Delay before server listens on port
							setTimeout(function () {
								require('fs').writeFileSync('.rebooted', 'rebooted');
							}, 1000);
						});
					}
				}
			}
		},
		mochacli: {
		  server: {
			src: ['test/server/**/*.js'],
			options: {
				reporter: 'spec',
				ui: 'bdd',
				harmony: true,
				'harmony-generators': true,
				timeout: 4000
			}
		  },
		  server_node_test: {
			src: ['test/node-test/**/*.js'],
			options: {
				reporter: 'spec',
				ui: 'bdd',
				harmony: true,
				'harmony-generators': true,
				timeout: 4000
			}
		  }
		}
	});
	require('load-grunt-tasks')(grunt);

	grunt.registerTask('default', ['concurrent:dev']);
	grunt.registerTask('serve', function (target) {
		if (!target) {
			target = 'dev';
		}
		// grunt.task.run('env:' + target.toLowerCase());
		process.env.NODE_ENV = 'production';
		grunt.task.run('concurrent:' + target.toLowerCase());
	});

	grunt.registerTask('server_node_test', ['mochacli:server_node_test']);
	grunt.registerTask('test', ['env:test', 'mochaTest:server', 'karma:unit']);
	grunt.registerTask('handy-test', ['env:test', 'concurrent:test']);
};