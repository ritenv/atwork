'use strict';

angular.module('atwork.posts')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/feed', {
        templateUrl: '/modules/posts/views/feed.html'
      })
      .when('/', {
        templateUrl: '/modules/posts/views/feed.html'
      })
      .when('/post/:postId', {
        templateUrl: '/modules/posts/views/feed.html'
      })
      ;
    $locationProvider.html5Mode(true);
  }]);