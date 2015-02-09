'use strict';

angular.module('atwork.system', ['ngRoute', 'ngMessages', 'ngResource', 'atwork.utils']);

angular.module('atwork.system')
.factory('tokenHttpInterceptor', [
  'appStorage',
  function (appStorage) {
    return {
      request: function (config) {
        // This is just example logic, you could check the URL (for example)
        // if (config.headers.Authorization === 'Bearer') {
          config.headers.Authorization = 'Bearer ' + appStorage.get('userToken');
        // }
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
  function ($httpProvider, $mdThemingProvider) {
    $httpProvider.interceptors.push('tokenHttpInterceptor');
    $mdThemingProvider.theme('default')
    .primaryPalette('teal')
    .accentPalette('blue-grey');
  }
]);
