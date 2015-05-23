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
            },
            activate: {
              method: 'POST',
              params: {action: 'activate'}
            },
            invite: {
              method: 'POST',
              params: {action: 'invite'}
            },
            resetPassword: {
              method: 'POST',
              params: {action: 'resetPassword'}
            }
          }),
        auth: $resource('users/authenticate'),
        notifications: $resource('users/notifications/:notificationId')
      }
    }
  ])
  .factory('appUsersSearch', [
    '$resource',
    function($resource) {
      var search = $resource('users/search/:keyword', {}, {query: {isArray: false}});
      return function(keyword, onlyUsernames) {
        //implement search logic here
        var criteria = {keyword: keyword};
        if (onlyUsernames) {
          criteria.onlyUsernames = true;
        }
        var promise = search.query(criteria).$promise;
        return promise;
      };
    }
  ])
  .factory('follow');