var myController = require('../controllers/users');
/**
 * Init the controller
 */
module.exports = function(System) {
  var users = myController(System);

  var routes = [];
  
  routes.push({
    method: 'post',
    path: '/',
    handler: users.create
  });

  routes.push({
    method: 'post',
    path: '/authenticate',
    handler: users.authenticate
  });

  routes.push({
    method: 'get',
    path: '/',
    handler: users.me,
    authorized: true
  });

  return routes;
};