'use strict';

angular.module('atwork.users')
  .factory('appUsers', ['$resource',
    function($resource) {
      return {
        single: $resource('users/:userId', {
            userId: '@_id'
          }, {
            update: {
              method: 'PUT'
            }
          }),
        auth: $resource('users/authenticate')
      }
    }
  ]);