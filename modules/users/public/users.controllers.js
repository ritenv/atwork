'use strict';

angular.module('atwork.users')
  .controller('ProfileCtrl', [
    '$scope',
    '$routeParams',
    '$location',
    'appUsers',
    'appAuth',
    function($scope, $routeParams, $location, appUsers, appAuth) {
      var userId = $routeParams.userId || appAuth.getUser()._id;
      if (!userId) {
        return $location.url('/');
      }

      appUsers.single.get({userId: userId}).$promise.then(function(response) {
        $scope.profile = response.res.record;
        $scope.following = response.res.following;
        $scope.followers = response.res.followers;
      });
      
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
    function($scope, $mdBottomSheet, $location) {
      $scope.items = [
        { 
          name: 'Profile',
          icon: 'fa-user',
          handler: function() {
            $location.url('/me');
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
