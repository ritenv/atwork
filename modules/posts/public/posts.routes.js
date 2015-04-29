'use strict';

angular.module('atwork.posts')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/feed', {
        templateUrl: '/modules/posts/views/feed.html',
        controller: 'PostsCtrl',
        resolve: {
          resolvedFeeds: [
            '$route',
            'appPostsFeed',
            function($route, appPostsFeed) {
              var deferred = Q.defer();
              var options = angular.extend({
                // feedsFilter: $scope.feedsFilter,
                limitComments: true,
                feedPage: 0
              }, $route.current.params);

              appPostsFeed.getFeeds(options, function(response) {
                deferred.resolve(response);
              });

              return deferred.promise;
            }
          ]
        }
      })
      .when('/feed/:hashtag', {
        templateUrl: '/modules/posts/views/feed.html'
      })
      .when('/', {
        templateUrl: '/modules/posts/views/feed.html'
      })
      .when('/post/:postId', {
        templateUrl: '/modules/posts/views/feed.html',
        controller: 'PostsCtrl',
        resolve: {
          resolvedFeeds: [
            '$route',
            'appPostsFeed',
            function($route, appPostsFeed) {
              var deferred = Q.defer();
              var options = angular.extend({
                feedPage: 0
              }, $route.current.params);

              appPostsFeed.getFeeds(options, function(response) {
                deferred.resolve(response);
              });

              return deferred.promise;
            }
          ]
        }
      })
      ;
    $locationProvider.html5Mode(true);
  }]);