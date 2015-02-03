var routes = require('./routes/users');

module.exports = function(System) {
  /**
   * Build the routes
   * @type {Array}
   */
  var builtRoutes = routes(System);

  /**
   * Add routes to System
   */
  System.route(builtRoutes);
};