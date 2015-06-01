var myController = require('../controllers/chats');
/**
 * Init the controller
 */
module.exports = function(System) {
  var chats = myController(System);

  var routes = [];
  
  routes.push({
    method: 'post',
    path: '/',
    handler: chats.create,
    authorized: true
  });

  routes.push({
    method: 'get',
    path: '/',
    handler: chats.list,
    authorized: true
  });

  routes.push({
    method: 'get',
    path: '/:chatId',
    handler: chats.single,
    authorized: true
  });

  routes.push({
    method: 'post',
    path: '/:chatId/message',
    handler: chats.message,
    authorized: true
  });

  return routes;
};