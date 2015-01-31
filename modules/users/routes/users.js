var controller = require('../controllers/users');
/**
 * Init the controller
 */
module.exports = function(System) {
  var users = controller(System);

  var endPoint = function(action) {
    return '/users' + (action ? '/' + action : '');
  };

  var routes = [];
  
  routes.push({
    method: 'POST',
    path: endPoint(),
    handler: users.create
  });

  return routes;
};