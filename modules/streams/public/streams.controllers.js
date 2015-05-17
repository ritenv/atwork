'use strict';

angular.module('atwork.streams')
  .controller('StreamsPurposeCtrl', [
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
      var streamId = $routeParams.streamId;

      $scope.getStream = function (streamId) {
        var stream = appStreams.single.get({streamId: streamId}, function() {
          $scope.stream = stream.res.record;
          $scope.stream.purpose = $scope.stream.purpose || 'Set the stream\'s purpose here...'
        });
      };

      $scope.updateStreamPurpose = function (isValid) {
        var stream = appStreams.single.get({streamId: streamId}, function() {
          stream = angular.extend(stream, $scope.stream);
          stream.$save(function(response) {
            appToast('Stream purpose updated.');
          });
        });
      };

      if (streamId) {
        $scope.getStream(streamId);
      }
    }
  ])
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
      // $scope.toSubscribe = '';

      $scope.clearThis = function(item) {
        console.log($scope);
        console.log(item);
        $timeout(function() {
          // $scope.toSubscribe = undefined;
        }, 2000);
      };

      $scope.processMoreStreams = function(selected) {
        $timeout(function() {
          if (selected === '1') {
            $scope.createNew();
            // $scope.toSubscribe = undefined;
          } else {
            var selectedStreamData = appStreams.single.get({streamId: selected}, function() {
              selectedStreamData.$subscribe({streamId: selected}, function() {
                $scope.updateStreams({reload: true});
                appToast('You have subscribed to the new stream.');
                appLocation.url('/stream/' + selected);
                // $scope.toSubscribe = undefined;
              });
            });
          }
        }, 500);
      };

      /**
       * Unsubscribe from a specific stream
       * @return {Void}
       */
      $scope.unsubscribe = function(stream) {
        var streamId = stream._id;
        var selectedStreamData = appStreams.single.get({streamId: streamId}, function() {
          selectedStreamData.$unsubscribe({streamId: streamId}, function() {
            $scope.updateStreams({reload: true});
            appToast('You have unsubscribed from that stream.');
          });
        });
      };

      $scope.updateStreams = function (options) {
        options = options || {};

        var streamsData = appStreams.single.get({subscribed: true}, function() {
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

        var moreStreamsData = appStreams.single.get({unsubscribed: true}, function() {
          $scope.moreStreams = moreStreamsData.res.records;
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
              appWebSocket.conn.emit('stream', response.res._id);
              $scope.actions.createNew = false;
              $scope.updateStreams({reload: true});
              appLocation.url('/stream/' + response.res._id);
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
       * If a stream has a new msg, show a badge
       */
      $rootScope.$on('stream-message', function(e, data) {
        angular.forEach($scope.streams, function(stream) {
          if (data.streamId === stream._id) {
            stream.unread = stream.unread ? stream.unread++ : 1;
          }
        });
        $scope.$digest();
      });

      /**
       * Clear the stream's badge
       * @param  {Object} stream The stream object
       * @return {Void}
       */
      $scope.clearBadge = function(stream) {
        stream.unread = 0;
      };

      /**
       * Listen to socket
       */
      appWebSocket.conn.on('stream', function() {
        appToast('Woot! There is a new stream available!');
        $scope.updateStreams({reload: true});
      });

      /**
       * Get the initial list
       */
      $scope.updateStreams();
    }
  ])
  ;
