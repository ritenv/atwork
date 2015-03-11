var s;
module.exports = function(System) {
  var ws = System.webSocket;
  ws.on('connection', function(socket){
    console.log('a user connected');
    s = socket;
    socket.on('disconnect', function() {
      console.log('user disconnected');
    });
  });

  var plugin = {
    /**
     * The helper register method
     * @return {Void}
     */
    register: function () {
      return {
        on: function(event, fn) {
          s.on(event, fn);
        },
        emit: function(event, arg) {
          s.emit(event, arg);
        },
        broadcast: function(event, arg) {
          s.broadcast.emit(event, arg);
        }
      };
    }
  };

  /**
   * Attributes to identify the plugin
   * @type {Object}
   */
  plugin.register.attributes = {
    name: 'WebSocket Helper',
    key: 'webSocket',
    version: '1.0.0'
  };
  return plugin;
};