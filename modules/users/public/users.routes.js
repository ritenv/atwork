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