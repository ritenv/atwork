'use strict';

angular.module('atwork.posts')
  .factory('appPosts', ['$resource',
    function($resource) {
      return {
        single: $resource('posts/:postId/:action', {
            postId: '@_id'
          }, {
            // update: {
            //   method: 'PUT'
            // },
            like: {
              method: 'POST',
              params: {action: 'like'}
            },
            unlike: {
              method: 'POST',
              params: {action: 'unlike'}
            }
          }),
        feed: $resource('posts/'),
        timeline: $resource('posts/timeline/:userId')
      }
    }
  ])
  ;
  