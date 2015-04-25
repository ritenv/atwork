'use strict';

angular.module('atwork.streams')
  .controller('StreamsCtrl', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$timeout',
    'appAuth',
    'appToast',
    'appStorage',
    'appLocation',
    'appWebSocket',
    'appStreams',
    function($scope, $rootScope, $routeParams, $timeout, appAuth, appToast, appStorage, appLocation, appWebSocket, appStreams) {
      $scope.streams = [];

      $scope.updateStreams = function(options) {
        options = options || {};
        
        var streamsData = appStreams.single.get({}, function() {
          /**
           * Check whether to append to feed (at bottom) or insert (at top)
           */
          if (!options.append) {
            $scope.streams = streamsData.res.records.concat($scope.streams);
          } else {
            $scope.streams = $scope.streams.concat(streamsData.res.records);
          }
          /**
           * Check if there are more pages
           * @type {Boolean}
           */
          $scope.noMoreStreams = !streamsData.res.morePages;
          /**
           * Set the updated timestamp
           */
          $scope.lastUpdated = Date.now();
        });
      };

      /**
       * Get the initial list
       */
      $scope.updateStreams();
    }
  ])
  ;
