'use strict';

angular.module('atwork.system', [
  'ngRoute', 
  'ngMessages', 
  'ngResource', 
  'angularFileUpload', 
  'atwork.utils',
  'angular-loading-bar', 
  'ngAnimate'
]);

angular.module('atwork.system')
.factory('tokenHttpInterceptor', [
  'appStorage',
  function (appStorage) {
    return {
      request: function (config) {
        config.headers.Authorization = 'Bearer ' + appStorage.get('userToken');
        return config;
      }
    };
  }
])
.factory('appSearch', [
  '$resource',
  function($resource) {
    var search = $resource('search/:keyword', {}, {query: {isArray: false}});
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
  'cfpLoadingBarProvider',
  function ($httpProvider, $mdThemingProvider, cfpLoadingBarProvider) {
    $httpProvider.interceptors.push('tokenHttpInterceptor');
    $mdThemingProvider.theme('default')
    .primaryPalette('brown')
    .accentPalette('blue-grey');

    cfpLoadingBarProvider.includeSpinner = true;
    cfpLoadingBarProvider.includeBar = false;
  }
]);
