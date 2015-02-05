'use strict';

angular.module('atwork.users', ['atwork.system'])
  .factory('appAuth', [
    'appStorage',
    function(appStorage) {
      return {
        isLoggedIn: function() {
          return appStorage.get('userToken');
        }
      }
    }
  ]);
