'use strict';

angular.module('atwork.posts')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/feed', {
        templateUrl: '/modules/posts/views/feed.html',
        controller: 'PostsCtrl'
      })
      ;
    $locationProvider.html5Mode(true);
  }]);