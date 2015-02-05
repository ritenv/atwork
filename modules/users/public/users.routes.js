'use strict';

angular.module('atwork.users')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/login', {
        templateUrl: 'modules/users/views/login.html',
        controller: 'LoginCtrl'
      });
    $locationProvider.html5Mode(true);
  }]);