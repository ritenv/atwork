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
    'appUsersSearch',
    'appPostsFeed',
    'resolvedFeeds',
    function($scope, $rootScope, $routeParams, $timeout, appPosts, appAuth, appToast, appStorage, appLocation, appWebSocket, appUsersSearch, appPostsFeed, resolvedFeeds) {
      $scope.content = '';
      $scope.lastUpdated = 0;
      $scope.postForm = '';
      $scope.newFeedCount = 0;
      $scope.feed = [];
      $scope.feedsFilter = '';
      $scope.limitComments = true;
      $scope.feedPage = 0;
      $scope.showBack = false;
      $scope.mentionsResults = [];

      var hashtag = $routeParams.hashtag;
      var userId = $scope.timelinePage = $routeParams.userId;
      var postId = $scope.detailPage = $routeParams.postId;
      var streamId = $scope.streamPage = $routeParams.streamId;

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
        $scope.feed.push({}); //spacer in the UI
        $scope.updateFeed({append: true});
      };

      /**
       * Function to update the feed on the client side
       * @param  {Object} data The data received from endpoint
       * @return {Void}
       */
      function doUpdate(data) {
        var options = data.config || {};

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
          $scope.feed = data.res.records.concat($scope.feed);
        } else {
          $scope.feed = $scope.feed.concat(data.res.records);
        }

        /**
         * Check if there are more pages
         * @type {Boolean}
         */
        $scope.noMorePosts = !data.res.morePages;
        /**
         * Set the updated timestamp
         */
        $scope.lastUpdated = Date.now();
        $scope.showBack = false;
      }

      $scope.updateFeed = function(options, passedData) {
        var options = options || {};
        appPostsFeed.getFeeds(angular.extend(options, {
          userId: userId,
          hashtag: hashtag,
          postId: postId,
          streamId: streamId,
          passedData: passedData,
          feedsFilter: $scope.feedsFilter,
          limitComments: $scope.limitComments,
          feedPage: $scope.feedPage
        }), function(response) {
          angular.extend($scope, response.config);
          doUpdate(response);
        });
      };

      /**
       * Initial feeds
       */
      angular.extend($scope, resolvedFeeds.config);
      doUpdate(resolvedFeeds);
      

      /**
       * Check if feed needs to be filtered
       * If not, call $scope.updateFeed() anyway as first run
       */
      var feedsFilterTimeout;
      $scope.$watch('feedsFilter', function(newValue, oldValue) {
        if (newValue !== oldValue) {
          $scope.feed = [];
        }

        $timeout.cancel(feedsFilterTimeout);
        feedsFilterTimeout = $timeout(function() {
          if (!newValue) {
            if ($scope.feedsFilterEnabled) {
              $scope.lastUpdated = 0;
              $scope.noPosting = false;
              $scope.updateFeed();
            }
          } else {
            $scope.noPosting = true;
            $scope.updateFeed();
          }
          $scope.feedsFilterEnabled = $scope.feedsFilter !== '';
        }, 500);
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
       * Search for mentions
       * @param  {String} content The content in which to look for the string
       * @return {Void}
       */
      var replaceCandidate = null;
      $scope.checkMentions = function(content, element) {
        if (!content) return;
        /**
         * Mention format will be @xyz, searching only end of text
         */
        var re = /@([A-Za-z0-9_]+)$/g;

        /**
         * The length should never be more than 1
         * @type {Array}
         */
        var mentions = content.match(re);

        if (mentions && mentions.length === 1 && mentions[0].length >= 4) {
          appUsersSearch(mentions[0].replace('@',''), false).then(function(response) {
            $scope.mentionsResults = response.res.items;
          });
        } else {
          $scope.mentionsResults = [];
        }
        
        /**
         * Remember the element
         */
        replaceCandidate = element;

        /**
         * Placement
         */
        var elem = angular.element(replaceCandidate);
        angular.element('.mentions-results').css({top: elem.offset().top });
      };

      /**
       * Replace selected mentions
       * @param  {String} username The selected item's username
       * @return {Void}
       */
      $scope.replaceName = function(username) {
        var re = /@([A-Za-z0-9_]+)$/g;
        // $scope.content = $scope.content.replace(re, '@' + username);
        var elem = angular.element(replaceCandidate);
        elem.val(elem.val().replace(re, '@' + username) + ' ');
        $timeout(function() {
          elem.change();
          elem.focus();
          $scope.mentionsResults = [];
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
            content: this.content,
            stream: streamId
          });
          
          post.$save(function(response) {
            if (response.success) {
              appWebSocket.emit('feed', response.res._id);
              appToast('You have posted successfully.');
              
              /**
               * We are the creator ourselves, we know that
               * @type {Object}
               */
              response.res = angular.extend(response.res, {
                creator: appAuth.getUser()
              });
              
              /**
               * Lets not update feed again from server, we have the data on the client
               * @type {Object}
               */
              $scope.updateFeed({}, {
                res: {
                  records: [response.res]
                }
              });

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
