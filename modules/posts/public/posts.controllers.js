'use strict';

angular.module('atwork.posts')
  .controller('PostsCtrl', [
    '$scope',
    '$rootScope',
    '$timeout',
    'appPosts',
    'appAuth',
    'appToast',
    'appStorage',
    'appLocation',
    function($scope, $rootScope, $timeout, appPosts, appAuth, appToast, appStorage, appLocation) {
      $scope.content = '';
      $scope.lastUpdated = 0;
      $scope.postForm = '';

      /**
       * Update feed items
       * @return {Void}
       */
      $scope.updateFeed = function() {
        $scope.lastUpdated = Date.now();
        $scope.feedData = appPosts.feed.get(function() {
          $scope.feed = $scope.feedData.res.records;
        });
      };
      $scope.updateFeed();

      /**
       * Reset the form
       * @return {Void}
       */
      $scope.reset = function(frm) {
        $scope.content = '';
        $timeout(function() {
          $scope.postForm.$setPristine();
          $scope.postForm.$setUntouched();
        });
      };

      /**
       * Create a new user
       * @param  {Boolean} isValid Will be true if form validation passes
       * @return {Void}
       */
      $scope.create = function(isValid) {
        if (isValid) {
          var post = new appPosts.single({
            content: this.content
          });

          post.$save(function(response) {
            if (response.success) {
              appToast('You have posted successfully.');
              $scope.updateFeed();
              $scope.reset();
            } else {
              $scope.failure = true;
              appToast(response.res.message);
            }
          });
        } else {
          
        }
      };

    }
  ])
  ;
