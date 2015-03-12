'use strict';

angular.module('atwork.users')
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
      $scope.$watch('search', function(newValue, oldValue) {
        if (!newValue || !newValue.length) {
          $scope.searchResults = [];
          return false;
        }
        appUsersSearch(newValue).then(function(response) {
          $scope.searchResults = response.res.items;
        });
      });
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
    function($scope, $routeParams, $location, $timeout, $upload, appUsers, appAuth, appToast, appPosts) {
      var userId = $routeParams.userId || appAuth.getUser()._id;

      /**
       * Cannot follow self
       * @type {Boolean}
       */
      $scope.selfProfile = (userId === appAuth.getUser()._id);

      if (!userId) {
        return $location.url('/');
      }

      /**
       * Get the user's profile
       * @return {Void}
       */
      $scope.getProfile = function() {
        appUsers.single.get({userId: userId}).$promise.then(function(response) {
          response.res.profile = response.res.record;
          angular.extend($scope, response.res);
        });
      };

      /**
       * Disable posting on the feed template
       * @type {Boolean}
       */
      $scope.noPosting = true;

      /**
       * Call it once by default
       */
      $scope.getProfile();

      /**
       * Follow the active user
       * @return {Void}
       */
      $scope.follow = function() {
        $scope.alreadyFollowing = '';
        var user = appUsers.single.get({userId: userId}, function() {
          user.$follow({userId: userId}, function() {
            $timeout(function() {$scope.getProfile();}, 800);
          });
        });
      };

      /**
       * Unfollow the active user
       * @return {Void}
       */
      $scope.unfollow = function() {
        $scope.alreadyFollowing = '';
        var user = appUsers.single.get({userId: userId}, function() {
          user.$unfollow({userId: userId}, function(response) {
            $timeout(function() {$scope.getProfile();}, 800);
          });
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
      
    }
  ])
  .controller('LogoutCtrl', [
    '$rootScope',
    'appStorage',
    'appLocation',
    function($rootScope, appStorage, appLocation) {
      appStorage.remove('userToken');
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
    function($scope, $rootScope, appUsers, appAuth, appToast, appStorage, appLocation) {
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
            designation: this.designation,
            password: this.password
          });

          user.$save(function(response) {
            if (response.success) {
              appToast('You have been registered, successfully.');
              $scope.reset();
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
            $location.url('/profile/' + angular.fromJson(appStorage.get('user'))._id);
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
