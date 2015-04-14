'use strict';

angular.module('atwork.settings')
  .controller('SettingsCtrl', [
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
      /**
       * Refresh settings from API
       */
      appSettings.fetch(function(settings) {
        $scope.systemSettings = settings;
      });

      if (appAuth.getUser().roles.indexOf('admin') === -1) {
        appToast('Only an Administrator can change system\'s settings.');
        appLocation.url('/');
      }

      $scope.save = function(isValid) {
        var req = new appSettings.single($scope.systemSettings);
        req.$save(function(res) {
          if (res.success) {
            appToast('Your settings are saved.');
            appLocation.url('/');
          }
        });
      };
    }
  ])
  ;
