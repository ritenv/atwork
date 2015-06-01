'use strict';

angular.module('atwork.chats')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      ;
    $locationProvider.html5Mode(true);
  }]);