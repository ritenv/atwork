'use strict';

angular.module('atwork.posts')
  .controller('PostsCtrl', [
    '$scope',
    '$route',
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
    function($scope, $route, $rootScope, $routeParams, $timeout, appPosts, appAuth, appToast, appStorage, appLocation, appWebSocket, appUsersSearch, appPostsFeed, resolvedFeeds) {
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
        $scope.feed.push({spacer: true}); //spacer in the UI
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

        /**
         * Set page title
         */
        if ($scope.timelinePage) {
          $scope.feedTitle = 'Timeline';
        } else if ($scope.streamPage) {
          $scope.feedTitle = '';
        } else if ($scope.detailPage) {
          $scope.feedTitle = 'Written by ' + $scope.feed[0].creator.name;
        } else {
          $scope.feedTitle = 'Lobby';
        }
      }

      $scope.updateFeed = function(options, passedData) {
        var options = options || {};
        appPostsFeed.getFeeds(angular.extend(options, $routeParams, {
          passedData: passedData,
          feedsFilter: $scope.feedsFilter,
          limitComments: $scope.limitComments,
          feedPage: $scope.feedPage,
          lastUpdated: $scope.lastUpdated
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

      var updateNewCount = function(event, data) {
        /**
         * Main stream notification
         */
        if (!data.streamId && !$route.current.params.streamId) {
          $scope.newFeedCount++;
          $scope.$digest();
        } else {
          var currentStream = $route.current.params.streamId;
          if (currentStream && currentStream === data.streamId) {
            $scope.newFeedCount++;
            $scope.$digest();
          } else {
            $rootScope.$broadcast('stream-message', data);
          }
        }
      };

      /**
       * Update a single item in the existing list if it exists
       * @param  {[type]} postId [description]
       * @return {[type]}        [description]
       */
      var updateItem = function(e, data) {
        _.each($scope.feed, function(candidate, i) {
          if (candidate._id == data.postId) {
            (function(item) {
              var params = {
                postId: data.postId
              };
              if ($scope.detailPage && item._id === $routeParams.postId) {
                params.allowMarking = true;
              }
              if (item._id == data.postId) {
                var post = appPosts.single.get(params, function() {
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
      $rootScope.$on('like', updateItem);
      $rootScope.$on('unlike', updateItem);
      $rootScope.$on('comment', updateItem);
      $rootScope.$on('feed', updateNewCount);

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
              
              /**
               * We are the creator ourselves, we know that
               * @type {Object}
               */
              response.res = angular.extend(response.res, {
                creator: appAuth.getUser()
              });
              
              /**
               * Update feed
               * @type {Object}
               */
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
