'use strict';

angular.module('atwork.users')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/login', {
        templateUrl: 'modules/users/views/login.html',
        controller: 'LoginCtrl'
      })
      .when('/logout', {
        templateUrl: 'modules/users/views/login.html',
        controller: 'LogoutCtrl'
      })
      ;
    $locationProvider.html5Mode(true);
  }]);