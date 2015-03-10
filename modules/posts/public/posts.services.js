'use strict';

angular.module('atwork.posts')
  .factory('appPosts', ['$resource',
    function($resource) {
      return {
        single: $resource('posts/:postId/:action', {
            postId: '@_id'
          }, {
            like: {
              method: 'POST',
              params: {action: 'like'}
            },
            unlike: {
              method: 'POST',
              params: {action: 'unlike'}
            },
            comment: {
              method: 'POST',
              params: {action: 'comment'}
            }
          }),
        feed: $resource('posts/'),
        timeline: $resource('posts/timeline/:userId')
      }
    }
  ])
  ;
  