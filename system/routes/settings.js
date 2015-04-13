var mongoose = require('mongoose');
var SystemSettings = mongoose.model('settings');

/**
 * Init the controller
 */
module.exports = function(System) {

  var routes = [];
  var json = System.plugins.JSON;
  
  routes.push({
    method: 'get',
    path: '/system-settings',
    authorized: true,
    handler: function(req, res) {
      SystemSettings
      .find({}, null, {sort: {name: 1}})
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