'use strict';

angular.module('atwork.users', ['atwork.system'])
  .factory('appAuth', [
    'appStorage',
    function(appStorage) {
      return {
        isLoggedIn: function() {
          return appStorage.get('userToken');
        },
        getToken: function() {
          return appStorage.get('userToken');
        },
        getUser: function() {
          var serialized = appStorage.get('user');
          if (serialized) {
            return angular.fromJson(serialized);
          } else {
            return {
              name: 'unknown'
            };
          }
        }
      }
    }
  ]);
