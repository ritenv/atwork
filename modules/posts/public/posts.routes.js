'use strict';

angular.module('atwork.posts')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/feed', {
        templateUrl: '/modules/posts/views/feed.html',
        controller: 'PostsCtrl',
        resolve: {
         resolvedFeeds: resolvedFeeds({limitComments: true})
        }
      })
      .when('/', {
        templateUrl: '/modules/posts/views/feed.html',
        controller: 'PostsCtrl',
        resolve: {
          resolvedFeeds: resolvedFeeds({limitComments: true})
        }
      })
      .when('/post/:postId', {
        templateUrl: '/modules/posts/views/feed.html',
        controller: 'PostsCtrl',
        resolve: {
          resolvedFeeds: resolvedFeeds({limitComments: false})
        }
      })
      .when('/feed/:hashtag', {
        templateUrl: '/modules/posts/views/feed.html',
        controller: 'PostsCtrl',
        resolve: {
          resolvedFeeds: resolvedFeeds({limitComments: true})
        }
      })
      ;
    $locationProvider.html5Mode(true);
  }]);

/**
 * Get configuration for resolved feeds to reuse in routes
 * @param  {Object} params Contains parameters for the options
 * @return {Array}
 */
function resolvedFeeds(params) {
  return [
    '$route',
    'appPostsFeed',
    function($route, appPostsFeed) {
      var deferred = Q.defer();
      var options = angular.extend({
        limitComments: params.limitComments
      }, $route.current.params);

      appPostsFeed.getFeeds(options, function(response) {
        deferred.resolve(response);
      });

      return deferred.promise;
    }
  ];
}