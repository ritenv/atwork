/**
 * Happy JSON response
 * @param  {Object} obj The info object
 * @return {Object}     The json response to be output
 */
var happy = function(obj) {
  return {
    success: 1,
    res: obj
  };
};

/**
 * Unhappy JSON response
 * @param  {Error} err The error object
 * @return {Object}     The json response to be output
 */
var unhappy = function(err) {
  return {
    success: 0,
    res: err
  };
};



module.exports = function(System) {
  var plugin = {
    /**
     * The helper register method
     * @param  {Object}   server  The hapi Server
     * @param  {Object}   options Any needed options
     * @param  {Function} next
     * @return {Void}
     */
    register: function (server, options, next) {
      server.method('unhappy', unhappy, {});
      server.method('happy', happy, {});
      System.JSON.unhappy = unhappy;
      System.JSON.happy = happy;
      next();
    }
  };

  /**
   * Attributes to identify the plugin
   * @type {Object}
   */
  plugin.register.attributes = {
    name: 'JSON Helper',
    version: '1.0.0'
  };
  return plugin;
};