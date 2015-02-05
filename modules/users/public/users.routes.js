'use strict';

angular.module('atwork.users')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    console.log('a');
    $routeProvider
      .when('/login', {
        templateUrl: 'modules/users/views/login.html'
      });
    $locationProvider.html5Mode(true);
  }]);