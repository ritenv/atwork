'use strict';

angular.module('atwork.posts')
  .controller('PostsCtrl', [
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
    function($scope, $rootScope, $routeParams, $timeout, appPosts, appAuth, appToast, appStorage, appLocation, appWebSocket) {
      $scope.content = '';
      $scope.lastUpdated = 0;
      $scope.postForm = '';
      $scope.newFeedCount = 0;
      $scope.feed = [];
      var userId = $routeParams.userId;
      var postId = $routeParams.postId;

      /**
       * Update feed items
       * @return {Void}
       */
      $scope.updateFeed = function() {
        if (userId) { //Get timeline
          var timelineData = appPosts.timeline.get({userId: userId, timestamp: $scope.lastUpdated}, function() {
            $scope.feed = timelineData.res.records.concat($scope.feed);
            $scope.lastUpdated = Date.now();
          });
        } else if (postId) { //Get timeline
          $scope.noPosting = true;
          var timelineData = appPosts.single.get({postId: postId}, function() {
            $scope.feed = [timelineData.res.record];
            $scope.lastUpdated = Date.now();
          });
        } else { //Get feed
          var feedData = appPosts.feed.get({timestamp: $scope.lastUpdated}, function() {
            $scope.feed = feedData.res.records.concat($scope.feed);
            $scope.lastUpdated = Date.now();
          });
        }
        $scope.newFeedCount = 0;
      };
      $scope.updateFeed();

      var updateNewCount = function(data) {
        var followers = data.followers;
        var creator = data.creator;
        if (creator === userId) {
          $scope.newFeedCount++;
          $scope.$digest();
        } else {
          var thisUser = angular.fromJson(appStorage.get('user'))._id;
          followers.map(function(user) {
            if (user._id === thisUser) {
              $scope.newFeedCount++;
              $scope.$digest();
            }
          });
        }
      };

      /**
       * Update a single item in the existing list if it exists
       * @param  {[type]} postId [description]
       * @return {[type]}        [description]
       */
      var updateItem = function(postId) {
        var filteredItems = $scope.feed.map(function(candidate, i) {
          if (candidate._id == postId) {
            (function(item) {
              if (item._id == postId) {
                var post = appPosts.single.get({postId: postId}, function() {
                  angular.extend(item, post.res.record);
                });
              }
            })(candidate);
          }
        });
      };

      /**
       * Enable socket listeners
       */
      appWebSocket.on('like', updateItem);
      appWebSocket.on('unlike', updateItem);
      appWebSocket.on('comment', updateItem);
      appWebSocket.on('feed', updateNewCount);

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
            appWebSocket.emit('like', item._id);
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
            appWebSocket.emit('unlike', item._id);
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
              appWebSocket.emit('feed', response.res._id);
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
              appWebSocket.emit('comment', item._id);
              item.commentEnabled = false;
            });
          });
        } else {
          
        }
      };

      
    }
  ])
  ;
