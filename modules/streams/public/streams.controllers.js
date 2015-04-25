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
      $scope.actions = {};

      $scope.updateStreams = function (options) {
        options = options || {};

        var streamsData = appStreams.single.get({}, function() {
          /**
           * Check if the feed needs to reload
           */
          if (options.reload) {
            $scope.streams = [];
          }

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

      $scope.createNew = function () {
        $scope.actions.createNew = true;
      };

      /**
       * Create a new post
       * @param  {Boolean} isValid Will be true if form validation passes
       * @return {Void}
       */
      $scope.create = function (isValid) {
        if (isValid) {
          var stream = new appStreams.single({
            title: this.newStreamName
          });
          stream.$save(function(response) {
            if (response.success) {
              appWebSocket.emit('stream', response.res._id);
              $scope.actions.createNew = false;
              appToast('New stream created successfully.');
              $scope.updateStreams({reload: true});
            } else {
              $scope.failure = true;
              appToast(response.res.message);
            }
          });
        } else {
          appToast('Bummer! Is the stream name good?');
        }
      };

      /**
       * Get the initial list
       */
      $scope.updateStreams();
    }
  ])
  ;
