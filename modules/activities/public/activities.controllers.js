'use strict';

angular.module('atwork.activities')
  .controller('ActivitiesCtrl', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$timeout',
    'appPosts',
    'appActivities',
    'appAuth',
    'appToast',
    'appStorage',
    'appLocation',
    'appWebSocket',
    function($scope, $rootScope, $routeParams, $timeout, appPosts, appActivities, appAuth, appToast, appStorage, appLocation, appWebSocket) {
      $scope.lastUpdated = 0;
      $scope.newActivitiesCount = 0;
      $scope.actions = [];
      var userId = $routeParams.userId;

      var activitiesData = appActivities.get({userId: userId, timestamp: $scope.lastUpdated}, function() {
        $scope.actions = activitiesData.res.records ? activitiesData.res.records.concat($scope.actions) : $scope.actions;
        $scope.lastUpdated = Date.now();
      });
    }
  ])
  ;
