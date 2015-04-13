'use strict';

angular.module('atwork.settings')
  .factory('appSettings', [
    '$resource',
    '$rootScope',
    function($resource, $rootScope) {
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
            $rootScope.systemSettings = $this.cache;
            return cb ? cb($this.cache) : true;
          });
        }
      }
    }
  ])
  .factory('appSettingsValid', [
    'appSettings',
    'appLocation',
    '$rootScope',
    function(appSettings, appLocation, $rootScope) {
      return function() {
        if (appLocation.url() !== '/settings' && appLocation.url() !== '/logout') {
          if (!$rootScope.systemSettings || !$rootScope.systemSettings.domains || !$rootScope.systemSettings.workplace) {
            appLocation.url('/settings');
            return false;
          }
        }
        return true;
      }
    }
  ])
  
  ;
  