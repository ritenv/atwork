/**
 * Happy JSON response
 * @param  {Object} obj The info object
 * @return {Object}     The json response to be output
 */
var happy = function(obj, res) {
  res.send({
    success: 1,
    res: obj
  });
};

/**
 * Unhappy JSON response
 * @param  {Error} err The error object
 * @return {Object}     The json response to be output
 */
var unhappy = function(err, res) {
  res.send({
    success: 0,
    res: err
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
        happy: happy,
        unhappy: unhappy
      };
    }
  };

  /**
   * Attributes to identify the plugin
   * @type {Object}
   */
  plugin.register.attributes = {
    name: 'JSON Helper',
    key: 'JSON',
    version: '1.0.0'
  };
  return plugin;
};