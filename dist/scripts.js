'use strict';

angular.module('atwork.utils', ['ngRoute', 'ngMaterial'])
.factory('appStorage', function() {
  return {
    get: function(item) {
      return localStorage.getItem(item);
    },
    set: function(item, val) {
      return localStorage.setItem(item, val);
    },
    remove: function(item) {
      return localStorage.removeItem(item);
    }
  }
})
.factory('appPromise', [
  function() {
    return function(fn) {
      var deferred = Q.defer();
      fn(deferred);
      return deferred.promise;
    }
  }
])
.factory('appLocation', [
  '$location', 
  function($location) {
    return $location;
  }
])
.factory('appWebSocket', [
  function($location) {
    var obj = {
      conn: {},
      connect: function() {
        var $this = this;
        var socket = window.io();
        socket.on('connect', function() {
          console.log('Connected');
        });
        socket.on('disconnect', function() {
          $this.connect();
        });
        this.conn = socket;
      },
      reconnect: function() {
        this.conn.close();
        this.connect();
      },
      close: function() {
        this.conn.close();
      }
    };
    obj.connect();
    return obj;
  }
])
.factory('appToast', [
  '$mdToast',
  function($mdToast) {
    return function(message) {
      var toast = $mdToast.simple()
        .content(message)
        .action('OK')
        .highlightAction(false)
        .position('top right');
      $mdToast.show(toast);
    }
  }
])
.factory('appDialog', [
  '$mdDialog',
  function($mdDialog) {
    return $mdDialog;
  }
])
.factory('appDesktop', [
  '$rootScope',
  function($rootScope) {
    var notifBadge = 0;
    var messageBadge = 0;
    return {
      notify: function(options) {
        notifBadge = (options.notificationsCount !== undefined) ? options.notificationsCount : notifBadge;
        messageBadge = (options.messagesCount !== undefined) ? options.messagesCount : messageBadge;
        $rootScope.badges = {messageBadge: messageBadge};
        if (window.fluid) {
          window.fluid.dockBadge = notifBadge + messageBadge;
          if (parseInt(window.fluid.dockBadge) <= 0) {
            window.fluid.dockBadge = undefined;
          } else {
            window.fluid.playSound('Sosumi');
            window.fluid.playSound('Purr');
          }
        }
      }
    }
  }
])
.directive('setFocus', [
  '$timeout', '$parse',
  function($timeout, $parse) {
    return {
      //scope: true,   // optionally create a child scope
      link: function(scope, element, attrs) {
        /**
         * Set focus only if not on mobile
         */
        if ($(window).width() <= 600) {
          return true;
        }
        var model = $parse(attrs.setFocus);
        scope.$watch(model, function(value) {
          if(value === true) {
            $timeout(function() {
              element[0].focus(); 
            }, 800);
          }
        });
      }
    };
  }
])

;

'use strict';

angular.module('atwork.system', [
  'ngRoute', 
  'ngMessages', 
  'ngResource', 
  'angularFileUpload', 
  'atwork.utils',
  // 'angular-loading-bar', 
  'ngAnimate'
]);

angular.module('atwork.system')
.factory('tokenHttpInterceptor', [
  'appStorage',
  '$timeout',
  'appWebSocket',
  function (appStorage, $timeout, appWebSocket) {
    // var 
    return {
      responseError: function(response) {
        var q = Q.defer();
        
        (function(response) {
          var config = response.config;

          appWebSocket.conn.on('response', onResponse);
          function onResponse(data) {
            if (data.resId === config.reqId) {
              console.log('Got', config.reqId, config.url, data.data);
              
              if (typeof data.data !== 'string') {
                response.data = data.data;
                response.reason = 'socket';
              }
              
              q.resolve(response);
              appWebSocket.conn.removeListener('response', onResponse);
            }
          }
        })(response);

        return q.promise;
      },
      request: function (config) {
        /**
         * Add Auth header to Request
         * @type {String}
         */
        config.headers.Authorization = 'Bearer ' + appStorage.get('userToken');

        /**
         * Check if not an API request
         */
        if (config.url.indexOf('/api/') === -1) {
          return config;
        }

        /**
         * Cache everything
         * @type {Boolean}
         */
        config.cached = true;

        var q = Q.defer();

        /**
         * Send a request identifier
         * @type {String}
         */
        config.reqId = 'REQUEST' + Math.round(Math.random() * 100000000000);

        appWebSocket.conn.emit('request', config);

        $timeout(function() {
          q.reject({config: config});
        });
        return q.promise;

        // return config;
      }
    };
  }
])
.factory('appSearch', [
  '$resource',
  function($resource) {
    var search = $resource('/api/search/:keyword', {}, {query: {isArray: false}});
    return function(keyword) {
      //implement search logic here
      var promise = search.query({keyword: keyword}).$promise;
      return promise;
    };
  }
])
.config([
  '$httpProvider',
  '$mdThemingProvider',
  // 'cfpLoadingBarProvider',
  function ($httpProvider, $mdThemingProvider) {
    $httpProvider.interceptors.push('tokenHttpInterceptor');
    // $mdThemingProvider.theme('default')
    // .primaryPalette('blue')
    // .accentPalette('blue-grey');

    // $mdThemingProvider.definePalette('primaryPalette', {
    //   '50': 'E4EFF7',
    //   '100': 'D6E0E7',
    //   '200': '77C0F4',
    //   '300': '63B4ED',
    //   '400': '40A8F2',
    //   '500': '36A5F4',
    //   '600': '249DF4',
    //   '700': '1196F4',
    //   '800': '0691F4',
    //   '900': '0A98FD',
    //   'A100': '89BEC8',
    //   'A200': '89BEC8',
    //   'A400': '89BEC8',
    //   'A700': '89BEC8',
    //   'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
    //                                       // on this palette should be dark or light
    //   'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
    //    '200', '300', '400', 'A100'],
    //   'contrastLightColors': undefined    // could also specify this if default was 'dark'
    // });
    
    // $mdThemingProvider.theme('default')
    //   .primaryPalette('primaryPalette')
    //   .accentPalette('primaryPalette')

    $mdThemingProvider.definePalette('amazingPaletteName', {
            '50': 'ffebee',
            '100': 'ffcdd2',
            '200': 'ef9a9a',
            '300': 'e57373',
            '400': 'ef5350',
            '500': 'f44336',
            '600': 'e53935',
            '700': 'd32f2f',
            '800': 'c62828',
            '900': 'b71c1c',
            'A100': 'ff8a80',
            'A200': 'ff5252',
            'A400': 'ff1744',
            'A700': 'd50000',
            'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                                // on this palette should be dark or light
            'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
             '200', '300', '400', 'A100'],
            'contrastLightColors': undefined    // could also specify this if default was 'dark'
          });
    $mdThemingProvider.theme('default')
      .primaryPalette('amazingPaletteName')
      .accentPalette('amazingPaletteName')

    // cfpLoadingBarProvider.includeSpinner = true;
    // cfpLoadingBarProvider.includeBar = false;
  }
]);

'use strict';

angular.module('atwork.settings', []);
'use strict';

angular.module('atwork.settings')
  .controller('SettingsCtrl', [
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
    'appSettings',
    function($scope, $rootScope, $routeParams, $timeout, appPosts, appAuth, appToast, appStorage, appLocation, appWebSocket, appUsersSearch, appSettings) {
      /**
       * Refresh settings from API
       */
      appSettings.fetch(function(settings) {
        $scope.systemSettings = settings;
      });

      if (appAuth.getUser().roles.indexOf('admin') === -1) {
        appToast('Only an Administrator can change system\'s settings.');
        appLocation.url('/');
      }

      $scope.save = function(isValid) {
        var req = new appSettings.single($scope.systemSettings);
        req.$save(function(res) {
          if (res.success) {
            appToast('Your settings are saved.');
            appLocation.url('/');
          }
        });
      };
    }
  ])
  ;

'use strict';

angular.module('atwork.settings')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/settings', {
        templateUrl: '/system/settings/views/settings.html',
        controller: 'SettingsCtrl'
      })
      ;
    $locationProvider.html5Mode(true);
  }]);
'use strict';

angular.module('atwork.settings')
  .factory('appSettings', [
    '$resource',
    '$rootScope',
    function($resource, $rootScope) {
      return {
        cache: {},
        single: $resource('/api/system-settings/'),
        fetch: function(cb) {
          var $this = this;
          var settings = $this.single.get({}, function() {
            for (var i in settings.res.items) {
              var setting = settings.res.items[i];
              $this.cache[setting.name] = setting.value;
            }
            $rootScope.systemSettings = $this.cache;
            return cb ? cb($this.cache) : true;
          });
        }
      }
    }
  ])
  .factory('appSettingsValid', [
    'appSettings',
    'appLocation',
    '$rootScope',
    function(appSettings, appLocation, $rootScope) {
      return function() {
        if (appLocation.url() !== '/settings' && appLocation.url() !== '/logout') {
          if (!$rootScope.systemSettings || !$rootScope.systemSettings.domains || !$rootScope.systemSettings.workplace) {
            appLocation.url('/settings');
            return false;
          }
        }
        return true;
      }
    }
  ])
  
  ;
  
'use strict';

angular.module('atwork.activities', ['atwork.system']);
'use strict';

angular.module('atwork.chats', ['atwork.system']);
'use strict';
angular.module('atwork.notifications', ['atwork.system'])
.run([
  '$rootScope',
	'appLocation',
	'appNotification',
	'appWebSocket',
  'appNotificationText',
	function($rootScope, appLocation, appNotification, appWebSocket, appNotificationText) {
		appWebSocket.conn.on('notification', function (data) {
      /**
       * Broadcast the notification to the application
       */
      $rootScope.$broadcast('notification', data);
      $rootScope.$broadcast(data.notificationType, data);

      /**
       * No data will be received if it is just a notification update signal
       */
      if (!data) return;

      /**
       * Prepare to show the notification
       */
      data.message = appNotificationText(data).text;

      data.then = function () {
        if (data.postId) {
          appLocation.url('/post/' + data.postId);
        } else if (data.userId) {
          appLocation.url('/profile/' + data.actor.username);
        }
      };

      appNotification.show(data);
    });

    /**
     * A system level notification is only
     * for broadcasting to the application
     */
    appWebSocket.conn.on('system', function (data) {
      /**
       * Broadcast the notification to the application
       */
      $rootScope.$broadcast(data.notificationType, data);
    });
	}
]);
'use strict';

angular.module('atwork.posts', ['atwork.system']);
'use strict';

angular.module('atwork.streams', ['atwork.system']);
'use strict';

angular.module('atwork.users', ['atwork.system'])
  .factory('appAuth', [
    '$http',
    '$resource',
    'appStorage',
    function($http, $resource, appStorage) {
      return {
        isLoggedIn: function() {
          return appStorage.get('userToken');
        },
        getToken: function() {
          return appStorage.get('userToken');
        },
        refreshUser: function(cb) {
          /**
           * FIXME: convert this to an ngResource call
           */
          $resource('/api/users/me').get(function(response) {
            console.log(response);
            var serializedUser = angular.toJson(response.res.record);
            appStorage.set('user', serializedUser);
            cb(response.res.record);
          });
        },
        getUser: function() {
          var serialized = appStorage.get('user');
          if (serialized) {
            return angular.fromJson(serialized);
          } else {
            return {
              name: 'unknown'
            };
          }
        }
      }
    }
  ]);

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

'use strict';

angular.module('atwork.chats')
  .controller('ChatsCtrl', [
    '$scope',
    '$rootScope',
    '$routeParams',
    '$timeout',
    'appAuth',
    'appToast',
    'appStorage',
    'appLocation',
    'appWebSocket',
    'appChats',
    'appDialog',
    'appDesktop',
    function($scope, $rootScope, $routeParams, $timeout, appAuth, appToast, appStorage, appLocation, appWebSocket, appChats, appDialog, appDesktop) {
      $scope.chats = [];
      $scope.actions = {};
      var openChats = {};

      var updateBadges = function() {
        /**
         * Update badge
         */
        var messagesCount = 0;
        _.each($scope.chats, function(chat) {
          messagesCount += chat.unread;
        })
        appDesktop.notify({messagesCount: messagesCount});
      };
      
      /**
       * Open a new conversation
       * @return {Void}
       */
      $scope.message = function(ev, profile, chatItem) {
        var criteria;

        if (chatItem) {
          chatItem.unread = 0;
          updateBadges();
          criteria = {
            chatId: chatItem._id
          };
        } else {
          criteria = {
            participants: [
              profile._id,
              appAuth.getUser()._id
            ]
          }
        }

        var chat = new appChats.single(criteria);

        chat.$save(function(response) {
          var chatId = response.res.record._id;

          /**
           * Add chat to openChats
           */
          openChats[response.res.record._id] = response.res.record;

          /**
           * Show dialog
           */
          appDialog.show({
            controller: [
              '$scope',
              'appDialog',
              function($scope, appDialog) {
                updateBadges();
                /**
                 * Assign likers to the users variable
                 * @type {Array}
                 */
                $scope.messages = response.res.record.messages;

                $scope.chatId = chatId;
                $scope.firstTime = true;

                $scope.$on('chatMessage', function(e, data) {
                  $scope.$apply(function() {
                    $scope.messages.unshift(data.chatMessage);
                  });
                  appWebSocket.conn.emit('markAccessed', {chatId: data.chatId, userId: appAuth.getUser()._id});
                });

                /**
                 * Hide the dialog
                 * @return {Void}
                 */
                $scope.hide = function() {
                  appDialog.hide();
                };

                $scope.sendMessage = function(isValid) {
                  if (isValid) {
                    var message = $scope.message;
                    $scope.message = '';
                    appChats.single.message({
                      message: message,
                      creator: appAuth.getUser()._id,
                      _id: $scope.chatId
                    }, function(response) {
                      $scope.messages.unshift(response.res.record.messages[0]);
                    });
                  }
                };
              }
            ],
            templateUrl: '/modules/chats/views/chat-dialog.html',
            targetEvent: ev,
          })
          .finally(function() {
            delete openChats[chatId];
          });

        });
      };

      $scope.updateChats = function (options) {
        options = options || {};
        var chatsData = appChats.single.get({}, function() {
          /**
           * Check if the feed needs to reload
           */
          if (options.reload) {
            $scope.chats = [];
          }

          /**
           * Check whether to append to feed (at bottom) or insert (at top)
           */
          if (chatsData.res.records.length) {
            if (!options.append) {
              $scope.chats = chatsData.res.records.concat($scope.chats);
            } else {
              $scope.chats = $scope.chats.concat(chatsData.res.records);
            }
          }

          updateBadges();

          /**
           * Check if there are more pages
           * @type {Boolean}
           */
          $scope.noMoreChats = !chatsData.res.morePages;

          /**
           * Set the updated timestamp
           */
          $scope.lastUpdated = Date.now();
        });
      };

      $scope.$on('chatMessage', function(e, data) {
        if (!openChats[data.chatId]) {
          $scope.updateChats({reload: true});
        }
      });

    }
  ])
  ;

'use strict';
angular.module('atwork.notifications')
.controller('notificationsCtrl', [
  '$scope',
  '$rootScope',
	'appLocation',
	'appUsers',
	'appNotification',
	'appWebSocket',
  'appNotificationText',
  'appDesktop',
	function($scope, $rootScope, appLocation, appUsers, appNotification, appWebSocket, appNotificationText, appDesktop) {
    /**
     * Initialize the defaults
     */
    $scope.notificationShown = false;
    $scope.notificationCount = 0;
    $scope.items = [];

    /**
     * The event will be broadcasted when new notifications are received
     */
    $rootScope.$on('notification', function(e, data) {
      $scope.updateNotifications();
    });

    /**
     * Hide or show notifications box
     * @param  {Object} $event 
     * @return {Void}        
     */
		$scope.showUserNotifications = function($event) {
		  $scope.notificationShown = !$scope.notificationShown;
		};

    /**
     * Mark notification as read
     * @param  {Object} item The item object
     * @return {Void}
     */
    $scope.markRead = function (item) {
      var record = appUsers.notifications.get({notificationId: item._id}, function () {
        if (record.res.notifications) {
          record.res.notifications.map(function (item) {
            item.display = appNotificationText(item);
          });
        }
        $scope.items = record.res.notifications;
        $scope.notificationCount = record.res.notifications.length;
      });
      $scope.showUserNotifications();
    };

    /**
     * Get notifications 
     * @return {Void}
     */
    $scope.updateNotifications = function () {
      var record = appUsers.notifications.get({}, function () {
        if (record.res.notifications) {
          record.res.notifications.map(function (item) {
            item.display = appNotificationText(item);
            if (item.post) {
              item.href = '/post/' + item.post._id
            } else if (item.user) {
              item.href = '/profile/' + item.actor.username
            }
          });
        }
        $scope.items = record.res.notifications;
        $scope.notificationCount = record.res.notifications ? record.res.notifications.length : 0;
        appDesktop.notify({notificationsCount: $scope.notificationCount});
        // if (window.fluid) {
        //   window.fluid.dockBadge = $scope.notificationCount ? $scope.notificationCount : undefined;
        //   if (window.fluid.dockBadge) {
        //     window.fluid.playSound('Sosumi');
        //     window.fluid.playSound('Purr');
        //   }
        // }
      });
    };

    /**
     * Get initial notifications on load
     */
    $scope.updateNotifications();

	}
]);
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

'use strict';

angular.module('atwork.users')
  .controller('ActivationCtrl', [
    '$rootScope',
    '$scope',
    '$routeParams',
    'appUsers',
    'appToast',
    'appStorage',
    'appLocation',
    function($rootScope, $scope, $routeParams, appUsers, appToast, appStorage, appLocation) {
      var auth = new appUsers.auth({
        userId: $routeParams.userId,
        activationCode: $routeParams.activationCode
      });
      auth.$save(function(response) {
        if (response.success) {
          appToast('Yayy! Your account is now active!');
          $scope.postLogin(response.res.record, response.res.token);
        } else {
          appToast(response.res.message);
        }
      });

      /**
       * Routine to perform after login is successful
       * @param  {String} token The user token
       * @return {Void}
       */
      $scope.postLogin = function(user, token) {
        var serializedUser = angular.toJson(user);
        appStorage.set('user', serializedUser);
        appStorage.set('userToken', token);
        $rootScope.$broadcast('loggedIn');
        appLocation.url('/');
      };

    }
  ])
  .controller('PasswordCtrl', [
    '$rootScope',
    '$scope',
    '$routeParams',
    'appUsers',
    'appToast',
    'appStorage',
    'appLocation',
    function($rootScope, $scope, $routeParams, appUsers, appToast, appStorage, appLocation) {
      var auth = new appUsers.auth({
        userId: $routeParams.userId,
        activationCode: $routeParams.activationCode
      });
      auth.$save(function(response) {
        if (response.success) {
          appToast('You are now logged in!');
          $scope.postLogin(response.res.record, response.res.token);
        } else {
          appToast(response.res.message);
        }
      });

      /**
       * Routine to perform after login is successful
       * @param  {String} token The user token
       * @return {Void}
       */
      $scope.postLogin = function(user, token) {
        var serializedUser = angular.toJson(user);
        appStorage.set('user', serializedUser);
        appStorage.set('userToken', token);
        $rootScope.$broadcast('loggedIn');
        appLocation.url('/profile/' + user.username + '/change-password');
      };

    }
  ])
  .controller('SearchCtrl', [
    '$scope',
    '$routeParams',
    '$location',
    '$timeout',
    '$upload',
    'appUsers',
    'appAuth',
    'appToast',
    'appUsersSearch',
    function($scope, $routeParams, $location, $timeout, $upload, appUsers, appAuth, appToast, appUsersSearch) {
      $scope.search = '';

      /**
       * Perform search operation
       */
      $scope.doSearch = function(val) {
        return appUsersSearch(val).then(function(response) {
          return response.res.items;
        });
      };

      /**
       * Go to selected user's profile
       */
      $scope.goToUser = function(item) {
        if (item && item.username) {
          $location.url('/profile/' + item.username);
        }
      };

      $scope.clearSearch = function() {
        $timeout(function() {
          $scope.search = '';
        }, 500);
      };

    }
  ])
  .controller('ProfileCtrl', [
    '$scope',
    '$routeParams',
    '$location',
    '$timeout',
    '$upload',
    'appUsers',
    'appAuth',
    'appToast',
    'appPosts',
    'profileData',
    'resolvedFeeds',
    'appPostsFeed',
    'appLocation',
    function($scope, $routeParams, $location, $timeout, $upload, appUsers, appAuth, appToast, appPosts, profileData, resolvedFeeds, appPostsFeed, appLocation) {
      var userId = $routeParams.userId || appAuth.getUser()._id;

      /**
       * Cannot follow self
       * @type {Boolean}
       */
      $scope.selfProfile = (userId === appAuth.getUser()._id) || (userId === appAuth.getUser().username);

      if (!userId) {
        return $location.url('/');
      }

      /**
       * Enable profile editing
       * @return {Void}
       */
      $scope.editProfile = function() {
        $scope.editMode = true;
      };

      /**
       * Go to change profile page
       * @return {Void}
       */
      $scope.changePassword = function() {
        appLocation.url('/profile/' + appAuth.getUser().username + '/change-password');
      };
      
      /**
       * Cancel profile editing
       * @return {Void}
       */
      $scope.cancelEditProfile = function() {
        $scope.editMode = false;
      };

      /**
       * Save profile data
       * @param  {Boolean} isValid If the form is valid
       * @return {Void}
       */
      $scope.updateProfile = function(isValid) {
        if (isValid) {
          if ($scope.password && ($scope.password !== $scope.password2)) {
            return appToast('Passwords do not match.');
          }
          var user = appUsers.single.get({userId: userId}, function() {
            user.name = $scope.profile.name;
            user.designation = $scope.profile.designation;
            if ($scope.password) {
              user.password = $scope.password;
            }
            delete user.res;
            user.$update(function(response) {
              if (response.success) {
                $scope.editMode = false;
                if ($scope.password) {
                  appLocation.url('/profile/' + response.res.username);
                }
              } else {
                $scope.failure = true;
                appToast(response.res.message);
              }
            });
          });
        } else {
          appToast('Something is missing.');
        }
      };

      var assignProfile = function assignedProfile(passedData) {
        console.log('PASSEDDATA', passedData.config)
        /**
         * Its possible that we were provided with a username instead of userID
         * Let's switch to using userId
         */
        userId = passedData.res.record.username;

        passedData.res.profile = passedData.res.record;
        angular.extend($scope, passedData.res);
      };

      /**
       * Get the user's profile
       * @return {Void}
       */
      $scope.getProfile = function() {
        appUsers.single.get({userId: userId}).$promise.then(function(response) {

          assignProfile(response);
        });
      };

      /**
       * Disable posting on the feed template
       * @type {Boolean}
       */
      $scope.noPosting = true;

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

      $scope.loadMore = function() {
        $scope.feedPage = $scope.feedPage || 0;
        $scope.feedPage++;
        $scope.lastUpdated = 0;
        $scope.feed.push({spacer: true}); //spacer in the UI
        $scope.updateFeed({append: true});
      };

      $scope.updateFeed = function(options) {
        var options = options || {};
        appPostsFeed.getFeeds(angular.extend(options, $routeParams, {
          limitComments: true,
          feedPage: $scope.feedPage
        }), function(response) {
          angular.extend($scope, response.config);
          doUpdate(response);
        });
      };

      /**
       * Follow the active user
       * @return {Void}
       */
      $scope.follow = function() {
        $scope.alreadyFollowing = '';
        var user = new appUsers.single({userId: userId});
        user.$follow({userId: userId}, function() {
          $timeout(function() {$scope.getProfile();}, 800);
        });
      };

      /**
       * Unfollow the active user
       * @return {Void}
       */
      $scope.unfollow = function() {
        $scope.alreadyFollowing = '';
        var user = new appUsers.single({userId: userId});
        user.$unfollow({userId: userId}, function(response) {
          $timeout(function() {$scope.getProfile();}, 800);
        });
      };

      $scope.$watch('avatar', function () {
        if ($scope.avatar && $scope.avatar.length) {
          $scope.uploadAvatar($scope.avatar);
        }
      });

      $scope.uploadAvatar = function() {
        if (!$scope.selfProfile) {
          return true;
        }
        var file = $scope.avatar.pop();
        $upload.upload({
          url: '/users/' + userId + '/avatar',
          file: file
        }).progress(function (evt) {
          var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
          console.log('progress: ' + progressPercentage + '% ' + evt.config.file.name);
        }).success(function (data, status, headers, config) {
          if (data && data.success) {
            $scope.profile.face = data.res.face;
          }
        });
      }

      /**
       * Resolved profile data, assign to $scope
       */
      assignProfile(profileData);
      // $scope.getProfile();

      /**
       * Initial feeds
       */
      angular.extend($scope, resolvedFeeds.config);
      doUpdate(resolvedFeeds);
      // $scope.updateFeed();
      
    }
  ])
  .controller('InviteCtrl', [
    '$rootScope',
    '$scope',
    'appStorage',
    'appLocation',
    'appDialog',
    'appUsers',
    'appAuth',
    'appToast',
    function($rootScope, $scope, appStorage, appLocation, appDialog, appUsers, appAuth, appToast) {
      /**
       * Show invitation dialog
       * @return {Void}
       */
      $scope.inviteOthers = function(ev) {
        /**
         * Show dialog
         */
        appDialog.show({
          controller: [
            '$scope',
            'appDialog',
            function($scope, appDialog) {
              $scope.inviteDone = false;
              /**
               * Invite the user
               * @param  {Boolean} isValid If the form is valid
               * @return {Void}
               */
              $scope.doInvite = function(isValid) {
                if (isValid) {
                  var userId = appAuth.getUser()._id;
                  var user = new appUsers.single({
                    userId: userId,
                    message: $scope.message,
                    email: $scope.email,
                    name: $scope.name
                  });
                  user.$invite({userId: userId}, function(response) {
                    if (response.success) {
                      $scope.inviteDone = true;
                    } else {
                      appToast(response.res.message);
                    }
                  });
                }
              };

              /**
               * Hide the dialog
               * @return {Void}
               */
              $scope.hide = function() {
                appDialog.hide();
              };
            }
          ],
          templateUrl: '/modules/users/views/users-invite-dialog.html',
          targetEvent: ev,
        });

      };
    }
  ])
  .controller('LogoutCtrl', [
    '$rootScope',
    'appStorage',
    'appLocation',
    function($rootScope, appStorage, appLocation) {
      appStorage.remove('userToken');
      appStorage.remove('user');
      $rootScope.$broadcast('loggedOut');
      appLocation.url('/login');
    }
  ])
  .controller('LoginCtrl', [
    '$scope',
    '$rootScope',
    'appUsers',
    'appAuth',
    'appToast',
    'appStorage',
    'appLocation',
    'appDialog',
    function($scope, $rootScope, appUsers, appAuth, appToast, appStorage, appLocation, appDialog) {
      // $scope.email = 'riten.sv@gmail.com';
      // $scope.password = 'jjk3e0jx';

      /**
       * Reset the form
       * @return {Void}
       */
      $scope.reset = function() {
        $scope.name = $scope.email = $scope.password = $scope.password2 = $scope.name = '';
      };

      /**
       * Create a new user
       * @param  {Boolean} isValid Will be true if form validation passes
       * @return {Void}
       */
      $scope.create = function(isValid) {
        if (isValid) {
          var user = new appUsers.single({
            email: this.email,
            name: this.name,
            username: this.username,
            designation: this.designation,
            password: this.password
          });

          user.$save(function(response) {
            /**
             * Save reference to use for resending activation email if needed
             * @type {Object}
             */
            $scope.registeredUserId = response.res._id;
            
            if (response.success) {
              if (response.res && response.res.record && response.res.record.active) {
                $scope.postLogin(response.res.record, response.res.token);
              } else {
                $scope.regDone = true;
              }
            } else {
              $scope.failure = true;
              appToast(response.res.message);
            }
          });
        } else {
          appToast('Something is missing.');
        }
      };

      /**
       * Resend activation email
       * @return {Void}
       */
      $scope.resendEmail = function() {
        var user = new appUsers.single({userId: $scope.registeredUserId});
        user.$activate({userId: $scope.registeredUserId}, function() {
          appToast('Success! An email has been sent to you again.');
        });
      };

      /**
       * Show forgot pwd dialog
       * @return {Void}
       */
      $scope.forgotPwd = function(ev) {
        /**
         * Show dialog
         */
        appDialog.show({
          controller: [
            '$scope',
            'appDialog',
            function($scope, appDialog) {
              $scope.inviteDone = false;
              /**
               * Invite the user
               * @param  {Boolean} isValid If the form is valid
               * @return {Void}
               */
              $scope.doReset = function(isValid) {
                if (isValid) {
                  var user = new appUsers.single({
                    email: $scope.email
                  });
                  user.$resetPassword({email: $scope.email}, function(response) {
                    if (response.success) {
                      $scope.submitDone = true;
                    } else {
                      appToast(response.res.message);
                    }
                  });
                }
              };

              /**
               * Hide the dialog
               * @return {Void}
               */
              $scope.hide = function() {
                appDialog.hide();
              };
            }
          ],
          templateUrl: '/modules/users/views/users-pwd-dialog.html',
          targetEvent: ev,
        });
      };

      /**
       * Login based on credentials
       * @param  {Boolean} isValid Whether the form is valid or not
       * @return {Void}
       */
      $scope.login = function(isValid) {
        if (isValid) {
          var auth = new appUsers.auth({
            email: this.email,
            password: this.password
          });
          auth.$save(function(response) {
            if (response.success) {
              appToast('You are now logged in.');
              $scope.postLogin(response.res.record, response.res.token);
            } else {
              appToast(response.res.message);
            }
          });
        } else {
          appToast('Something is missing.');
        }
      };

      /**
       * Routine to perform after login is successful
       * @param  {String} token The user token
       * @return {Void}
       */
      $scope.postLogin = function(user, token) {
        var serializedUser = angular.toJson(user);
        appStorage.set('user', serializedUser);
        appStorage.set('userToken', token);
        $rootScope.$broadcast('loggedIn');
        appLocation.url('/');
      };

      /**
       * If already logged in, go home
       */
      if (appAuth.isLoggedIn()) {
        appLocation.url('/');
      }
    }
  ])
  .controller('UserSheet', [
    '$scope',
    '$mdBottomSheet',
    '$location',
    'appStorage',
    function($scope, $mdBottomSheet, $location, appStorage) {
      $scope.items = [
        { 
          name: 'Profile',
          icon: 'fa-user',
          handler: function() {
            $location.url('/profile/' + angular.fromJson(appStorage.get('user')).username);
          }
        },
        { 
          name: 'Logout',
          icon: 'fa-sign-out',
          handler: function() {
            $location.url('/logout');
          }
        }
      ];
      $scope.listItemClick = function($index) {
        var clickedItem = $scope.items[$index];
        $mdBottomSheet.hide(clickedItem);
        clickedItem.handler();
      };
    }
  ])

;

'use strict';

angular.module('atwork.activities')
  .factory('appActivities', ['$resource',
    function($resource) {
      return $resource('/api/activities/feed/:userId', {
            userId: '@_id'
        });
    }
  ])
  ;
  
'use strict';

angular.module('atwork.chats')
  .factory('appChats', ['$resource',
    function($resource) {
      return {
        single: $resource('/api/chats/:chatId/:action', {
            chatId: '@_id'
          }, {
            message: {
              method: 'POST',
              params: {action: 'message'}
            },
            end: {
              method: 'POST',
              params: {action: 'end'}
            }
          })
      }
    }
  ])
  ;
  
'use strict';

angular.module('atwork.notifications')
  .factory('appNotification', [
    '$resource',
    '$mdToast',
    function($resource, $mdToast) {
      return {
        show: function(data) {
          if (!data.message) {
            return;
          }
          var toast = $mdToast.simple()
            .content(data.message)
            .action('VIEW')
            .highlightAction(false)
            .position('bottom right');

          $mdToast.show(toast).then(function() {
            if (data.then) {
              data.then();
            }
          });
          if (window.fluid) {
            window.fluid.showGrowlNotification({
                title: "Atwork", 
                description: data.message, 
                priority: 1, 
                sticky: false,
                identifier: "foo",
                onclick: function() {
                  // window.fluid.activate();
                },
                icon: imgEl // or URL string
            });
          }
        }
      }
    }
  ])
  .factory('appNotificationText', [
    function() {
      return function(obj) {
        if (!obj) return {text: ''};
        var msg = '';
        var actor = obj.actor;

        switch (obj.notificationType) {
          case 'like':
          msg = actor.name + ' has liked a post';
          break;
          
          case 'comment':
          msg = actor.name + ' has commented on a post';
          break;
          
          case 'follow':
          msg = actor.name + ' is now following you';
          break;

          case 'mention':
          msg = actor.name + ' mentioned you in a post';
          break;
        }
        return {text: msg};
      }
    }
  ])
  ;
  
'use strict';

angular.module('atwork.posts')
  .factory('appPosts', ['$resource',
    function($resource) {
      return {
        single: $resource('/api/posts/:postId/:action', {
            postId: '@_id'
          }, {
            like: {
              method: 'POST',
              params: {action: 'like'}
            },
            unlike: {
              method: 'POST',
              params: {action: 'unlike'}
            },
            comment: {
              method: 'POST',
              params: {action: 'comment'}
            },
            likes: {
              method: 'GET',
              params: {action: 'likes'}
            }
          }),
        feed: $resource('/api/posts/'),
        stream: $resource('/api/posts/stream/:streamId'),
        timeline: $resource('/api/posts/timeline/:userId')
      }
    }
  ])
  .filter('appPostFormat', [
    '$sce',
    function($sce) {
      return function(text) {
        var hashtags = new RegExp('#([A-Za-z0-9]+)', 'g');
        text = text.replace(hashtags, function(hashtag) {
          return '<a href="/feed/'+ hashtag.replace('#', '') +'">' + hashtag + '</a>'
        });

        var mentions = new RegExp('@([A-Za-z0-9_]+)', 'g');
        text = text.replace(mentions, function(mention) {
          return '<a href="/profile/'+ mention.replace('@', '') +'">' + mention + '</a>'
        });
        
        /**
         * Emoticons
         */
        var emots = [
          {
            key: ':)',
            value: 'fa-smile-o'
          }, {
            key: ':|',
            value: 'fa-meh-o'
          }, {
            key: ':(',
            value: 'fa-frown-o'
          }, {
            key: '(y)',
            value: 'fa-thumbs-o-up'
          }, {
            key: '(n)',
            value: 'fa-thumbs-o-down'
          }, {
            key: ':+1',
            value: 'fa-thumbs-up'
          }, {
            key: '(h)',
            value: 'fa-heart'
          }, {
            key: '(i)',
            value: 'fa-lightbulb-o'
          },
        ];

        var emotTemplate = '<md-inline-list-icon class="yellow fa {{emoticon}}"></md-inline-list-icon>';
        for (var i in emots) {
          var key = emots[i].key;
          var value = emots[i].value;
          text = text.replace(key, emotTemplate.replace('{{emoticon}}', value));
        };
        
        return $sce.trustAsHtml(text);
      };
    }
  ])
  .factory('appPostsFeed', [
    'appPosts',
    function(appPosts) {
      return {
        getFeeds: function(options, cb) {
          options = options || {};
          var userId = options.userId;
          var hashtag = options.hashtag;
          var postId = options.postId;
          var streamId = options.streamId;
          var passedData = options.passedData;

          /**
           * Configuration for the service
           * that will also be returned
           * @type {Object}
           */
          var config = options;

          if (userId) {
            /**
             * TIMELINE: If there is a userId, let's load feeds of the specific user
             */
            /**
             * Disable posting
             * @type {Boolean}
             */
            config.noPosting = true;
            /**
             * Show limited comments
             * @type {Boolean}
             */
            config.limitComments = true;

            /**
             * Prepare the request
             */
            var timelineData = appPosts.timeline.get({
              userId: userId,
              timestamp: config.lastUpdated,
              filter: config.feedsFilter,
              limitComments: config.limitComments,
              page: config.feedPage
            }, function() {
              doUpdate(timelineData);
            });

          } else if (streamId) {
            /**
             * STREAM: If there is a streamId, let's load feeds of the specific stream
             */
            
            /**
             * Show limited comments
             * @type {Boolean}
             */
            config.limitComments = true;

            /**
             * Prepare the request
             */
            var streamsData = appPosts.stream.get({
              streamId: streamId,
              timestamp: config.lastUpdated,
              filter: config.feedsFilter,
              limitComments: config.limitComments,
              page: config.feedPage
            }, function() {
              doUpdate(streamsData);
            });
          } else if (postId) {
            /**
             * SINGLE: If there is a postId, let's load a single feed
             */
            /**
             * Disable filtering if its a single feed
             * @type {Boolean}
             */
            config.noFiltering = true;
            /**
             * Disable posting
             * @type {Boolean}
             */
            config.noPosting = true;
            /**
             * No load-more button
             * @type {Boolean}
             */
            config.noMorePosts = true;
            /**
             * Get ready to show all comments
             */
            delete config.limitComments;

            /**
             * Prepare the request
             */
            var timelineData = appPosts.single.get({
              postId: postId, 
              limitComments: config.limitComments,
              allowMarking: true
            }, function() {
              /**
               * The retrieved record is the only one to show
               * @type {Array}
               */
              timelineData.res.records = [timelineData.res.record];
              doUpdate(timelineData);

              /**
               * Set the last updated timestamp
               */
              config.lastUpdated = Date.now();
              config.showBack = true;
            });
          } else {
            /**
             * FEED: If there is no postId and no userId, let's load the user's latest feed
             */
            /**
             * Limit comments
             * @type {Boolean}
             */
            config.limitComments = true;

            /**
             * Prepare the request
             */
            var feedData = appPosts.feed.get({
              timestamp: config.lastUpdated, 
              filter: config.feedsFilter, 
              limitComments: config.limitComments,
              page: config.feedPage
            }, function() {
              doUpdate(feedData);
            });
          }

          /**
           * If data was sent to the function directly
           * update it for faster client side updates
           */
          if (passedData) {
            doUpdate(passedData);
          }

          /**
           * Default feedcount to 0
           * @type {Number}
           */
          config.newFeedCount = 0;

          /**
           * Function to update the feed on the client side
           * @param  {Object} data The data received from endpoint
           * @return {Void}
           */
          function doUpdate(data) {
            config.lastUpdated = Date.now();
            data.config = config;
            cb(data);
          }

        }
      }
    }
  ])
  .directive('awFeedItem', [
    'appPosts',
    'appWebSocket',
    'appAuth',
    'appDialog',
    function(appPosts, appWebSocket, appAuth, appDialog) {
      return {
        templateUrl: '/modules/posts/views/post-single.html',
        controller: [
          '$scope',
          function($scope) {

            /**
             * Like the post
             * @param  {Object} item The item object
             * @return {Void}      
             */
            $scope.doLike = function(item) {
              item.liked = true;
              appPosts.single.like(item, function(response) {
                angular.extend(item, response.res.record);
              });
            };

            /**
             * Unlike the post
             * @param  {Object} item The item object
             * @return {Void}      
             */
            $scope.undoLike = function(item) {
              item.liked = false;
              appPosts.single.unlike(item, function(response) {
                angular.extend(item, response.res.record);
              });
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

                item.comment = commentContent;

                appPosts.single.comment(item, function(response) {
                  angular.extend(item, response.res.record);
                  item.commentEnabled = false;
                });
                
              }
            };

            /**
             * Show the list of likers for a specific post
             * @param  {Object} item The post item
             * @return {Void}
             */
            $scope.showLikers = function(ev, item) {
              /**
               * Get the likers
               */
              appPosts.single.likes({
                postId: item._id
              }, function(response) {
                /**
                 * Show dialog
                 */
                appDialog.show({
                  controller: [
                    '$scope',
                    'appDialog',
                    function($scope, appDialog) {
                      /**
                       * Assign likers to the users variable
                       * @type {Array}
                       */
                      $scope.users = response.res.records;
                      /**
                       * Hide the dialog
                       * @return {Void}
                       */
                      $scope.hide = function() {
                        appDialog.hide();
                      };
                    }
                  ],
                  templateUrl: '/modules/users/views/users-dialog.html',
                  targetEvent: ev,
                });
              });
            };

          }
        ]
      }
    }
  ])
  ;
  
'use strict';

angular.module('atwork.streams')
  .factory('appStreams', ['$resource',
    function($resource) {
      return {
        single: $resource('/api/streams/:streamId/:action', {
            streamId: '@_id'
          }, {
            subscribe: {
              method: 'POST',
              params: {action: 'subscribe'}
            },
            unsubscribe: {
              method: 'POST',
              params: {action: 'unsubscribe'}
            }
          })
      }
    }
  ])
  ;
  
'use strict';

angular.module('atwork.users')
  .factory('appUsers', ['$resource',
    function($resource) {
      return {
        single: $resource('/api/users/:userId/:action', {
            userId: '@_id'
          }, {
            update: {
              method: 'PUT'
            },
            follow: {
              method: 'POST',
              params: {action: 'follow'}
            },
            unfollow: {
              method: 'POST',
              params: {action: 'unfollow'}
            },
            activate: {
              method: 'POST',
              params: {action: 'activate'}
            },
            invite: {
              method: 'POST',
              params: {action: 'invite'}
            },
            resetPassword: {
              method: 'POST',
              params: {action: 'resetPassword'}
            }
          }),
        auth: $resource('/api/users/authenticate'),
        notifications: $resource('/api/users/notifications/:notificationId')
      }
    }
  ])
  .factory('appUsersSearch', [
    '$resource',
    function($resource) {
      var search = $resource('/api/users/search/:keyword', {}, {query: {isArray: false}});
      return function(keyword, onlyUsernames) {
        //implement search logic here
        var criteria = {keyword: keyword};
        if (onlyUsernames) {
          criteria.onlyUsernames = true;
        }
        var promise = search.query(criteria).$promise;
        return promise;
      };
    }
  ])
  .factory('follow');
'use strict';

angular.module('atwork.activities')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    
    $locationProvider.html5Mode(true);
  }]);
'use strict';

angular.module('atwork.chats')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      ;
    $locationProvider.html5Mode(true);
  }]);
'use strict';

angular.module('atwork.posts')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/feed', {
        templateUrl: '/modules/posts/views/feed.html',
        controller: 'PostsCtrl',
        resolve: {
         resolvedFeeds: resolvedFeeds({limitComments: true})
        }
      })
      .when('/', {
        templateUrl: '/modules/posts/views/feed.html',
        controller: 'PostsCtrl',
        resolve: {
          resolvedFeeds: resolvedFeeds({limitComments: true})
        }
      })
      .when('/post/:postId', {
        templateUrl: '/modules/posts/views/feed.html',
        controller: 'PostsCtrl',
        resolve: {
          resolvedFeeds: resolvedFeeds({limitComments: false})
        }
      })
      .when('/feed/:hashtag', {
        templateUrl: '/modules/posts/views/feed.html',
        controller: 'PostsCtrl',
        resolve: {
          resolvedFeeds: resolvedFeeds({limitComments: true})
        }
      })
      ;
    $locationProvider.html5Mode(true);
  }]);

/**
 * Get configuration for resolved feeds to reuse in routes
 * @param  {Object} params Contains parameters for the options
 * @return {Array}
 */
function resolvedFeeds(params) {
  return [
    '$route',
    'appPostsFeed',
    function($route, appPostsFeed) {
      var deferred = Q.defer();
      var options = angular.extend({
        limitComments: params.limitComments
      }, $route.current.params);

      appPostsFeed.getFeeds(options, function(response) {
        deferred.resolve(response);
      });

      return deferred.promise;
    }
  ];
}
'use strict';

angular.module('atwork.streams')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/stream/:streamId', {
        templateUrl: '/modules/posts/views/feed.html',
        controller: 'PostsCtrl',
        resolve: {
          resolvedFeeds: [
            '$route',
            'appPostsFeed',
            function($route, appPostsFeed) {
              var deferred = Q.defer();
              var options = angular.extend({
                limitComments: true
              }, $route.current.params);

              appPostsFeed.getFeeds(options, function(response) {
                deferred.resolve(response);
              });

              return deferred.promise;
            }
          ]
        }
      })
      ;
    $locationProvider.html5Mode(true);
  }]);
'use strict';

angular.module('atwork.users')
  .config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    $routeProvider
      .when('/login', {
        templateUrl: '/modules/users/views/login.html?v',
        controller: 'LoginCtrl'
      })
      .when('/logout', {
        templateUrl: '/modules/users/views/login.html?v',
        controller: 'LogoutCtrl'
      })
      .when('/activate/:userId/:activationCode', {
        templateUrl: '/modules/users/views/activating.html',
        controller: 'ActivationCtrl'
      })
      .when('/changePassword/:userId/:activationCode', {
        templateUrl: '/modules/users/views/change-password.html',
        controller: 'PasswordCtrl'
      })
      .when('/profile/:userId/change-password', {
        templateUrl: '/modules/users/views/change-password.html',
        controller: 'ProfileCtrl',
        resolve: {
          profileData: [
            '$route',
            'appAuth', 
            'appUsers',
            function($route, appAuth, appUsers) {
              var routeParams = $route.current.params;
              var userId = routeParams.userId || appAuth.getUser()._id;
              return appUsers.single.get({userId: userId}).$promise;
            }
          ],
          resolvedFeeds: [
            '$route',
            'appPostsFeed',
            function($route, appPostsFeed) {
              var deferred = Q.defer();
              var options = angular.extend({
                feedPage: 0
              }, $route.current.params);

              appPostsFeed.getFeeds(options, function(response) {
                deferred.resolve(response);
              });

              return deferred.promise;
            }
          ]
        }
      })
      .when('/profile/:userId', {
        templateUrl: '/modules/users/views/profile.html?v',
        controller: 'ProfileCtrl',
        resolve: {
          profileData: [
            '$route',
            'appAuth', 
            'appUsers',
            function($route, appAuth, appUsers) {
              var routeParams = $route.current.params;
              var userId = routeParams.userId || appAuth.getUser()._id;
              return appUsers.single.get({userId: userId}).$promise;
            }
          ],
          resolvedFeeds: [
            '$route',
            'appPostsFeed',
            function($route, appPostsFeed) {
              var deferred = Q.defer();
              var options = angular.extend({
                feedPage: 0
              }, $route.current.params);

              appPostsFeed.getFeeds(options, function(response) {
                deferred.resolve(response);
              });

              return deferred.promise;
            }
          ]
        }
      })
      .when('/me', {
        templateUrl: '/modules/users/views/profile.html?v',
        controller: 'ProfileCtrl'
      })
      ;
    $locationProvider.html5Mode(true);
  }]);
var app = angular.module('AtWork', [
  'atwork.system', 
  'atwork.users', 
  'atwork.posts', 
  'atwork.streams', 
  'atwork.chats', 
  'atwork.activities', 
  'atwork.notifications', 
  'atwork.settings', 
  'ngMaterial']);

app.controller('AppCtrl', [
  '$scope', 
  '$route',
  '$rootScope', 
  '$mdSidenav',
  '$mdBottomSheet',
  '$location',
  '$timeout',
  'appLocation',
  'appAuth',
  'appWebSocket',
  'appSettings',
  'appSettingsValid',
  'appToast',
  function($scope, $route, $rootScope, $mdSidenav, $mdBottomSheet, $location, $timeout, appLocation, appAuth, appWebSocket, appSettings, appSettingsValid, appToast) {
    $scope.barTitle = '';
    $scope.search = '';

    $scope.toggleSidenav = function(menuId) {
      $mdSidenav(menuId).toggle();
    };

    $scope.updateLoginStatus = function() {
      $scope.isLoggedIn = appAuth.isLoggedIn();
      $scope.user = appAuth.getUser();
    };

    $scope.goHome = function() {
      appLocation.url('/');
    };

    $scope.showUserActions = function($event) {
      $mdBottomSheet.show({
        templateUrl: '/modules/users/views/user-list.html',
        controller: 'UserSheet',
        targetEvent: $event
      }).then(function(clickedItem) {
        $scope.alert = clickedItem.name + ' clicked!';
      });
    };

    var initiateSettings = function(cb) {
      appSettings.fetch(function(settings) {
        $rootScope.systemSettings = settings;
        if (cb) {
          cb();
        }
      });
    };

    /**
     * Scroll the view to top on route change
     */
    $scope.$on('$routeChangeSuccess', function() {
      angular.element('*[md-scroll-y]').animate({scrollTop: 0}, 300);
      $mdSidenav('left').close();
    });

    $scope.$on('loggedIn', function() {
      $scope.updateLoginStatus();
      $scope.barTitle = '';
      $scope.$broadcast('updateNotifications');
      appWebSocket.conn.emit('online', {token: appAuth.getToken()});
      appAuth.refreshUser(function(user) {
        $scope.user = user;
      });
      /**
       * Fetch settings and get the app ready
       */
      initiateSettings(function() {
        $scope.$on('$routeChangeStart', function (event, toState) {
          var valid = appSettingsValid();
          if (!valid) {
            appToast('Please complete the setup first.');
          }
        });
        $scope.appReady = true;
        $scope.barTitle = $rootScope.systemSettings.tagline;
        $timeout(appSettingsValid);
      });
      
    });

    $scope.$on('loggedOut', function() {
      $scope.updateLoginStatus();
      appWebSocket.conn.emit('logout', {token: appAuth.getToken()});
    });

    appWebSocket.conn.on('connect', function() {
      if (appAuth.isLoggedIn()) {
        appWebSocket.conn.emit('online', {token: appAuth.getToken()});
      }
    });

    $scope.updateLoginStatus();
    $timeout(function() {
      if (!appAuth.isLoggedIn()) {
        if (window.location.href.indexOf('/activate/') == -1 && window.location.href.indexOf('/changePassword/') == -1) {
          appLocation.url('/login');
        }
        initiateSettings();
        $scope.appReady = true;
      } else {
        $scope.barTitle = '';
        $scope.$broadcast('loggedIn');
      }
      
    });
  }
]);