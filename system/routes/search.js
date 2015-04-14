var mongoose = require('mongoose');
var User = mongoose.model('User');

/**
 * Init the controller
 */
module.exports = function(System) {

  var routes = [];
  var json = System.plugins.JSON;
  
  routes.push({
    method: 'get',
    path: '/search/:keyword',
    authorized: true,
    handler: function(req, res) {
      var keyword = req.param('keyword');
      User
      .find({name: new RegExp(keyword, 'ig')}, null, {sort: {name: 1}})
      .lean()
      .exec(function(err, items) {
        if (err) {
          return json.unhappy(err, res);
        }
        return json.happy({ items: items }, res);
      });
    }
  });
  return routes;
};