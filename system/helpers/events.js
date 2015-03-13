var registeredEvents = {};
var registerType = function(e) {
  if (typeof registeredEvents[e] !== 'object' || registeredEvents[e].constructor.name !== 'Array') {
    registeredEvents[e] = [];
  }
};
var isRegisteredEvent = function(e) {
  return (typeof registeredEvents[e] === 'object' && registeredEvents[e].constructor.name === 'Array');
};
var registerEvent = function(e, cb) {
  registeredEvents[e].push(cb);
};
var triggerEvent = function(e, args) {
  registeredEvents[e].map(function(cb) {
    cb(args);
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
        on: function(e, cb, args) {
          registerType(e);
          registerEvent(e, cb, args);
        },
        trigger: function(e, args) {
          if (isRegisteredEvent(e)) {
            triggerEvent(e, args);
          }
        }
      };
    }
  };

  /**
   * Attributes to identify the plugin
   * @type {Object}
   */
  plugin.register.attributes = {
    name: 'Events Helper',
    key: 'event',
    version: '1.0.0'
  };
  return plugin;
};