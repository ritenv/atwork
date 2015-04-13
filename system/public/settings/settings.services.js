'use strict';

angular.module('atwork.settings')
  .factory('appSettings', ['$resource',
    function($resource) {
      return {
        cache: {},
        single: $resource('system-settings/'),
        fetch: function(cb) {
          var $this = this;
          var settings = $this.single.get({}, function() {
            for (var i in settings.res.items) {
              var setting = settings.res.items[i];
              $this.cache[setting.name] = setting.value;
            }
            return cb ? cb($this.cache) : true;
          });
        }
      }
    }
  ])
  .factory('appSettingsCache', [
    'appSettings',
    function(appSettings) {
      
    }
  ])
  
  ;
  