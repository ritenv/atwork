'use strict';

angular.module('atwork.users', ['atwork.system'])
  .factory('appAuth', [
    '$http',
    'appStorage',
    function($http, appStorage) {
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
          $http.get('/users/me').success(function(response) {
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
