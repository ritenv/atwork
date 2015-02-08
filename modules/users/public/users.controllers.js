'use strict';

angular.module('atwork.users')
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
              $scope.postLogin(response.res.token);
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
      $scope.postLogin = function(token) {
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
  ]);
