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
            // follow: {
            //   method: 'POST',
            //   params: {action: 'follow'}
            // },
            // unfollow: {
            //   method: 'POST',
            //   params: {action: 'unfollow'}
            // }
          }),
        timeline: $resource('posts/timeline')
      }
    }
  ])
  ;
  