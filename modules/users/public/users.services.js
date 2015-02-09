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
  .factory('follow');