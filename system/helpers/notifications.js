
module.exports = function(System) {
  var sck = System.webSocket;
  var plugin = {
    /**
     * The helper register method
     * @return {Void}
     */
    register: function () {
      return {
        send: function(socketId, data) {
          sck.to(socketId).emit('notification', data);
        }
      };
    }
  };

  /**
   * Attributes to identify the plugin
   * @type {Object}
   */
  plugin.register.attributes = {
    name: 'Notifications Helper',
    key: 'notifications',
    version: '1.0.0'
  };
  return plugin;
};