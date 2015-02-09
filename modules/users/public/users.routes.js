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
      .when('/profile/:userId', {
        templateUrl: 'modules/users/views/profile.html',
        controller: 'ProfileCtrl'
      })
      ;
    $locationProvider.html5Mode(true);
  }]);