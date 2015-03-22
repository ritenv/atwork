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
      $scope.feedsFilter = '';
      $scope.limitComments = true;
      $scope.feedPage = 0;
      $scope.showBack = false;

      var hashtag = $routeParams.hashtag;
      var userId = $routeParams.userId;
      var postId = $routeParams.postId;

      if (hashtag) {
        $scope.feedsFilter = '#' + hashtag;
      }

      /**
       * Back for history
       * @return {Void}
       */
      $scope.back = function() {
        history.go(-1);
      };

      $scope.loadMore = function() {
        $scope.feedPage++;
        $scope.lastUpdated = 0;
        $scope.updateFeed({append: true});
      };

      /**
       * Update feed items
       * @return {Void}
       */
      $scope.updateFeed = function(options) {
        options = options || {};

        if (userId) {
          /**
           * TIMELINE: If there is a userId, let's load feeds of the specific user
           */
          /**
           * Disable posting
           * @type {Boolean}
           */
          $scope.noPosting = true;
          /**
           * Show limited comments
           * @type {Boolean}
           */
          $scope.limitComments = true;

          /**
           * Prepare the request
           */
          var timelineData = appPosts.timeline.get({
            userId: userId,
            timestamp: $scope.lastUpdated,
            filter: $scope.feedsFilter,
            limitComments: $scope.limitComments,
            page: $scope.feedPage
          }, function() {
            /**
             * If it's a filter request, emoty the feeds
             */
            if ($scope.feedsFilter) {
              $scope.feed = [];
            }
            /**
             * Check whether to append to feed (at bottom) or insert (at top)
             */
            if (!options.append) {
              $scope.feed = timelineData.res.records.concat($scope.feed);
            } else {
              $scope.feed = $scope.feed.concat(timelineData.res.records);
            }
            /**
             * Check if there are more pages
             * @type {Boolean}
             */
            $scope.noMorePosts = !timelineData.res.morePages;
            /**
             * Set the updated timestamp
             */
            $scope.lastUpdated = Date.now();
            $scope.showBack = false;
          });
        } else if (postId) {
          /**
           * SINGLE: If there is a postId, let's load a single feed
           */
          /**
           * Disable filtering if its a single feed
           * @type {Boolean}
           */
          $scope.noFiltering = true;
          /**
           * Disable posting
           * @type {Boolean}
           */
          $scope.noPosting = true;
          /**
           * No load-more button
           * @type {Boolean}
           */
          $scope.noMorePosts = true;
          /**
           * Get ready to show all comments
           */
          delete $scope.limitComments;

          /**
           * Prepare the request
           */
          var timelineData = appPosts.single.get({
            postId: postId, 
            limitComments: $scope.limitComments
          }, function() {
            /**
             * The retrieved record is the only one to show
             * @type {Array}
             */
            $scope.feed = [timelineData.res.record];
            /**
             * Set the last updated timestamp
             */
            $scope.lastUpdated = Date.now();
            $scope.showBack = true;
          });
        } else {
          /**
           * FEED: If there is no postId and no userId, let's load the user's latest feed
           */
          /**
           * Limit comments
           * @type {Boolean}
           */
          $scope.limitComments = true;

          /**
           * Prepare the request
           */
          var feedData = appPosts.feed.get({
            timestamp: $scope.lastUpdated, 
            filter: $scope.feedsFilter, 
            limitComments: $scope.limitComments,
            page: $scope.feedPage
          }, function() {
            /**
             * If it's a filter request, emoty the feeds
             */
            if ($scope.feedsFilter && !options.append) {
              $scope.feed = [];
            }
            /**
             * Check whether to append to feed (at bottom) or insert (at top)
             */
            if (!options.append) {
              $scope.feed = feedData.res.records.concat($scope.feed);
            } else {
              $scope.feed = $scope.feed.concat(feedData.res.records);
            }
            /**
             * If no posts found, hide the loadmore button
             */
            if (!feedData.res.records.length) {
              $scope.noMorePosts = true;
            }
            /**
             * Check if there are more pages
             * @type {Boolean}
             */
            $scope.noMorePosts = !feedData.res.morePages;
            /**
             * Set the updated timestamp
             */
            $scope.lastUpdated = Date.now();
            $scope.showBack = false;
          });
        }
        $scope.newFeedCount = 0;
      };

      /**
       * Check if feed needs to be filtered
       * If not, call $scope.updateFeed() anyway as first run
       */
      $scope.$watch('feedsFilter', function(newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.feed = [];
        }
        if (!newValue) {
          $scope.lastUpdated = 0;
          $scope.noPosting = false;
          $scope.updateFeed();
        } else {
          $scope.noPosting = true;
          $scope.updateFeed();
        }
        $scope.feedsFilterEnabled = $scope.feedsFilter !== '';
      });

      var updateNewCount = function(data) {
        var followers = data.followers;
        var creator = data.creator;
        if (creator === userId) {
          $scope.newFeedCount++;
          $scope.$digest();
        } else if (!userId && !postId) {
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
          
          /**
           * Enable client side comments update for faster response time
           */
          item.commentEnabled = false;
          item.comments.unshift({
            creator: appAuth.getUser(),
            content: commentContent
          });

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
