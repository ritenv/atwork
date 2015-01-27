var routes = require('./routes/users');

module.exports = function(System) {
  /**
   * Build the routes
   */
  var builtRoutes = routes(System);

  /**
   * Add routes to System
   */
  System.route(builtRoutes);
};