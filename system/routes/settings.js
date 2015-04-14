var mongoose = require('mongoose');
var async = require('async');
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
    authorized: false,
    handler: function(req, res) {
      var criteria = {};
      if (!req.user) {
        criteria = {
          name: { $in: ['workplace', 'tagline'] }
        };
      }
      SystemSettings
      .find(criteria, null, {sort: {name: 1}})
      .lean()
      .exec(function(err, items) {
        if (err) {
          return json.unhappy(err, res);
        }
        return json.happy({ items: items }, res);
      });
    }
  });

  routes.push({
    method: 'post',
    path: '/system-settings',
    authorized: true,
    handler: function(req, res) {
      /**
       * Received settings
       * @type {Object}
       */
      var settingItems = req.body;

      /**
       * Check if user is an admin
       */
      if (!req.user.isAdmin()) {
        console.log('FORBIDDEN ADMIN');
        /**
         * Return as is
         */
        return json.happy({ items: settingItems }, res);
      }
      
      /**
       * Function to save an individual setting
       * @param  {Object}
       * @param  {Function}
       * @return {Void}
       */
      var saveSetting = function(setting, cb) {
        SystemSettings
        .findOne({name: setting.key})
        .exec(function(err, item) {
          if (err) {
            return json.unhappy(err, res);
          }
          if (item) {
            item.value = setting.val;
          } else {
            item = new SystemSettings();
            item.name = setting.key;
            item.value = setting.val;
          }
          item.save(function(err) {
            cb(err);
          });
        });
      };

      /**
       * Create an array of items
       * @type {Array}
       */
      var items = [];
      for (var key in settingItems) {
        var val = settingItems[key];
        items.push({key: key, val: val});
      };

      /**
       * Save all gathered settings
       */
      async.map(items, saveSetting, function(err, results) {
        console.log(results);
        return json.happy({ items: items, results: results }, res);
      });

    }
  });
  return routes;
};