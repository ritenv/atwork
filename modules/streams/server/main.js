var routes = require('./routes/streams');

module.exports = function(System) {
  /**
   * Name of this module
   * @type {String}
   */
  var moduleName = 'streams';

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