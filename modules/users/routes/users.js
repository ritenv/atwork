module.exports = function() {
  var routes = [];
  routes.push({
    method: 'GET',
    path: '/hello',
    handler: function(req, res) {
      res('Hello world');
    }
  });
  return routes;
};