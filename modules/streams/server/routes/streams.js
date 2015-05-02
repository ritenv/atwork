var myController = require('../controllers/streams');
/**
 * Init the controller
 */
module.exports = function(System) {
  var streams = myController(System);

  var routes = [];
  
  routes.push({
    method: 'post',
    path: '/',
    handler: streams.create,
    authorized: true
  });

  routes.push({
    method: 'get',
    path: '/',
    handler: streams.list,
    authorized: true
  });

  routes.push({
    method: 'get',
    path: '/:streamId',
    handler: streams.single,
    authorized: true
  });

  routes.push({
    method: 'post',
    path: '/:streamId',
    handler: streams.modify,
    authorized: true
  });

  routes.push({
    method: 'post',
    path: '/:streamId/subscribe',
    handler: streams.subscribe,
    authorized: true
  });

  routes.push({
    method: 'post',
    path: '/:streamId/unsubscribe',
    handler: streams.unsubscribe,
    authorized: true
  });

  routes.push({
    method: 'delete',
    path: '/:streamId',
    handler: streams.remove,
    authorized: true
  });

  return routes;
};