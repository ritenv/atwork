var fs = require('fs');
var _ = require('lodash');

/**
 * Unhappy JSON response
 * @param  {Error} err The error object
 * @return {Object}     The json response to be output
 */
var generate = function(options, cb) {
  var emailTemplate = fs.readFile(options.template ? options.template : (__dirname + '/../public/templates/notification.html'), function(err, fileContent) {
    var ejs = require('ejs');
    var html = ejs.render(fileContent.toString(), options);
    cb(html);
  });
};

module.exports = function(System) {
  var plugin = {
    /**
     * The helper register method
     * @return {Void}
     */
    register: function () {
      return {
        generate: function(options, cb) {
          options = _.extend(options, System.settings);
          return generate(options, cb);
        }
      };
    }
  };

  /**
   * Attributes to identify the plugin
   * @type {Object}
   */
  plugin.register.attributes = {
    name: 'Email Helper',
    key: 'emailing',
    version: '1.0.0'
  };
  return plugin;
};