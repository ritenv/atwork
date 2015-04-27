'use strict';

angular.module('atwork.streams')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/stream/:streamId', {
        templateUrl: '/modules/posts/views/feed.html'
      })
      ;
    $locationProvider.html5Mode(true);
  }]);