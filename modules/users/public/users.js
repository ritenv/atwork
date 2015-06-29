'use strict';

angular.module('atwork.users', ['atwork.system'])
  .factory('appAuth', [
    '$http',
    '$resource',
    'appStorage',
    function($http, $resource, appStorage) {
      return {
        isLoggedIn: function() {
          return appStorage.get('userToken');
        },
        getToken: function() {
          return appStorage.get('userToken');
        },
        refreshUser: function(cb) {
          /**
           * FIXME: convert this to an ngResource call
           */
          $resource('/api/users/me').get(function(response) {
            console.log(response);
            var serializedUser = angular.toJson(response.res.record);
            appStorage.set('user', serializedUser);
            cb(response.res.record);
          });
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
