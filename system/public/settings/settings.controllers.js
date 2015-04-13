'use strict';

angular.module('atwork.settings')
  .controller('Settings', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$timeout',
    'appPosts',
    'appAuth',
    'appToast',
    'appStorage',
    'appLocation',
    'appWebSocket',
    'appUsersSearch',
    'appSettings',
    function($scope, $rootScope, $routeParams, $timeout, appPosts, appAuth, appToast, appStorage, appLocation, appWebSocket, appUsersSearch, appSettings) {
      var settings = appSettings.single.get({}, function() {
        $rootScope.systemSettings = settings;
      });
    }
  ])
  ;
