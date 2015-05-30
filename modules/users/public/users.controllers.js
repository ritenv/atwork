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
