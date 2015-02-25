var myController = require('../controllers/posts');
/**
 * Init the controller
 */
module.exports = function(System) {
  var posts = myController(System);

  var routes = [];
  
  routes.push({
    method: 'post',
    path: '/',
    handler: posts.create,
    authorized: true
  });

  routes.push({
    method: 'get',
    path: '/',
    handler: posts.feed,
    authorized: true
  });

  routes.push({
    method: 'get',
    path: '/timeline',
    handler: posts.timeline,
    authorized: true
  });

  routes.push({
    method: 'get',
    path: '/:postId',
    handler: posts.single,
    authorized: true
  });

  return routes;
};