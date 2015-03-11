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
    'appWebSocket',
    function($scope, $rootScope, $timeout, appPosts, appAuth, appToast, appStorage, appLocation, appWebSocket) {
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
       * Like the post
       * @param  {Object} item The item object
       * @return {Void}      
       */
      $scope.doLike = function(item) {
        item.liked = true;
        var post = appPosts.single.get({postId: item._id}, function() {
          post.$like({postId: item._id}, function() {
            angular.extend(item, post.res.record);
          });
        });
      };

      /**
       * Unlike the post
       * @param  {Object} item The item object
       * @return {Void}      
       */
      $scope.undoLike = function(item) {
        item.liked = false;
        var post = appPosts.single.get({postId: item._id}, function() {
          post.$unlike({postId: item._id}, function() {
            angular.extend(item, post.res.record);
          });
        });
      };

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
       * Create a new post
       * @param  {Boolean} isValid Will be true if form validation passes
       * @return {Void}
       */
      $scope.create = function(isValid, item) {
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

      /**
       * Comment on a post
       * @param  {Boolean} isValid Will be true if form validation passes
       * @return {Void}
       */
      $scope.comment = function(isValid, item) {
        if (isValid) {
          var commentContent = this.content;
          var $this = this;
          var post = appPosts.single.get({postId: item._id}, function() {
            post.comment = commentContent;
            delete post.res;
            delete post.success;
            post.$comment({postId: item._id}, function() {
              angular.extend(item, post.res.record);
              item.commentEnabled = false;
            });
          });
        } else {
          
        }
      };

      
    }
  ])
  ;
