'use strict';

angular.module('atwork.activities')
  .factory('appPosts', ['$resource',
    function($resource) {
      return {
        $resource('activities', {
            postId: '@_id'
        });
      }
    }
  ])
  ;
  