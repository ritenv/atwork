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
      .when('/profile/:userId', {
        templateUrl: '/modules/users/views/profile.html?v',
        controller: 'ProfileCtrl',
        resolve: {
          profileData: function($routeParams, appAuth, appUsers) {
            var userId = $routeParams.userId || appAuth.getUser()._id;
            return appUsers.single.get({userId: userId}).$promise;
          }
        }
      })
      .when('/me', {
        templateUrl: '/modules/users/views/profile.html?v',
        controller: 'ProfileCtrl'
      })
      ;
    $locationProvider.html5Mode(true);
  }]);