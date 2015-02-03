var myController = require('../controllers/users');
/**
 * Init the controller
 */
module.exports = function(System) {
  var users = myController(System);

  var endPoint = function(action) {
    return '/users' + (action ? '/' + action : '');
  };

  var routes = [];
  
  routes.push({
    method: 'post',
    path: endPoint(),
    handler: users.create
  });

  return routes;
};