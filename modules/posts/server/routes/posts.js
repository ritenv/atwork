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
    path: '/timeline/:userId',
    handler: posts.timeline,
    authorized: true
  });

  routes.push({
    method: 'get',
    path: '/stream/:streamId',
    handler: posts.streamPosts,
    authorized: true
  });

  routes.push({
    method: 'get',
    path: '/:postId',
    handler: posts.single,
    authorized: true
  });

  routes.push({
    method: 'post',
    path: '/:postId/like',
    handler: posts.like,
    authorized: true
  });

  routes.push({
    method: 'post',
    path: '/:postId/comment',
    handler: posts.comment,
    authorized: true
  });

  routes.push({
    method: 'get',
    path: '/:postId/likes',
    handler: posts.likes,
    authorized: true
  });

  routes.push({
    method: 'post',
    path: '/:postId/unlike',
    handler: posts.unlike,
    authorized: true
  });

  return routes;
};