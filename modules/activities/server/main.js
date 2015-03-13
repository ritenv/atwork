var routes = require('./routes/activities');

module.exports = function(System) {
  /**
   * Name of this module
   * @type {String}
   */
  var moduleName = 'activities';

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