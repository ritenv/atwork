var routes = require('./routes/users');

module.exports = function(System) {
  System.route(routes());
};