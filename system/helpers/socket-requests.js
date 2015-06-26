module.exports = function(System) {
  var sck = System.webSocket;
  var plugin = {
    /**
     * The helper register method
     * @return {Void}
     */
    register: function () {
      sck.on('connection', function(socket) {
        socket.on('request', function(params) {
          console.log(params.url);
          console.log(params.transformRequest);
          setTimeout(function() {
            socket.emit('response', {resId: params.reqId, data: {dummy: true}});
          }, 1000);
        });
      });
      return {
        
      };
    }
  };

  /**
   * Attributes to identify the plugin
   * @type {Object}
   */
  plugin.register.attributes = {
    name: 'Web Requests over Socket',
    key: 'socketRequests',
    version: '1.0.0'
  };
  return plugin;
};