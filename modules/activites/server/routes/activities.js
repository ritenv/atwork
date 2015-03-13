var myController = require('../controllers/activities');
/**
 * Init the controller
 */
module.exports = function(System) {
  var activities = myController(System);

  var routes = [];
  
  routes.push({
    method: 'get',
    path: '/feed/:userId',
    handler: activities.feed,
    authorized: true
  });

  return routes;
};