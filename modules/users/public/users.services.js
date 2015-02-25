'use strict';

angular.module('atwork.users')
  .factory('appUsers', ['$resource',
    function($resource) {
      return {
        single: $resource('users/:userId/:action', {
            userId: '@_id'
          }, {
            update: {
              method: 'PUT'
            },
            follow: {
              method: 'POST',
              params: {action: 'follow'}
            },
            unfollow: {
              method: 'POST',
              params: {action: 'unfollow'}
            }
          }),
        auth: $resource('users/authenticate')
      }
    }
  ])
  .factory('appUsersSearch', [
    '$resource',
    function($resource) {
      var search = $resource('users/search/:keyword', {}, {query: {isArray: false}});
      return function(keyword) {
        //implement search logic here
        var promise = search.query({keyword: keyword}).$promise;
        return promise;
      };
    }
  ])
  .factory('follow');