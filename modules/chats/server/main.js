var routes = require('./routes/chats');

module.exports = function(System) {
  /**
   * Name of this module
   * @type {String}
   */
  var moduleName = 'chats';

  /**
   * Build the routes
   * @type {Array}
   */
  var builtRoutes = routes(System);

  /**
   * Add routes to System
   */
  System.route(builtRoutes, moduleName);
};