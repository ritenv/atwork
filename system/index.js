/**
 * Load dependencies
 */
var Hapi = require('hapi');
var fs = require('fs');

/**
 * Path where modules are located
 */
var modulePath = __dirname + '/../modules';

/**
 * Create new server
 * @type {Object}
 */
var server = new Hapi.Server();

/**
 * Create config for ports
 */
server.connection({
  host: 'localhost',
  port: 8111
});

var loadModules = function(System, callback) {
  fs.readdir(modulePath, function(err, list) {
    list.forEach(function(folder) {
      var moduleName = folder;
      var moduleFile = modulePath + '/' + folder + '/main.js';
      if (fs.existsSync(moduleFile)) {
        require(moduleFile)(System);
      }
    });
    callback();
    //require('../modules/users/main')(system);
  });
};

/**
 * Export the object
 * @type {Object}
 */
module.exports = {
  server: server,
  boot: function() {
    loadModules(this, function() {
      server.start();
    });
  },
  route: function(routes) {
    server.route(routes);
  }
};