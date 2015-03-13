'use strict';

angular.module('atwork.activities')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    
    $locationProvider.html5Mode(true);
  }]);