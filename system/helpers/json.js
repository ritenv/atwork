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

var list = function(obj, res) {
  res.send(obj);
};

/**
 * Unhappy JSON response
 * @param  {Error} err The error object
 * @return {Object}     The json response to be output
 */
var unhappy = function(err, res) {
  var obj = {
    success: 0,
    res: err
  };
  if (obj.res.errors) {
    obj.res.messages = [];
    for (var i in obj.res.errors) {
      obj.res.messages.push(obj.res.errors[i].message);
    }
    obj.res.message = obj.res.messages[0];
  }
  res.send(obj);
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
        list: list,
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