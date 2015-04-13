'use strict';

angular.module('atwork.settings')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/settings', {
        templateUrl: '/system/settings/views/settings.html'
      })
      ;
    $locationProvider.html5Mode(true);
  }]);