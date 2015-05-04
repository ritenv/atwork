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
    // $mdThemingProvider.theme('default')
    // .primaryPalette('blue')
    // .accentPalette('blue-grey');

    $mdThemingProvider.definePalette('primaryPalette', {
      '50': 'E4EFF7',
      '100': 'D6E0E7',
      '200': '77C0F4',
      '300': '63B4ED',
      '400': '40A8F2',
      '500': '36A5F4',
      '600': '249DF4',
      '700': '1196F4',
      '800': '0691F4',
      '900': '0A98FD',
      'A100': 'A6AE73',
      'A200': 'ABB661',
      'A400': 'B3C254',
      'A700': 'BCCF46',
      'contrastDefaultColor': 'light',    // whether, by default, text (contrast)
                                          // on this palette should be dark or light
      'contrastDarkColors': ['50', '100', //hues which contrast should be 'dark' by default
       '200', '300', '400', 'A100'],
      'contrastLightColors': undefined    // could also specify this if default was 'dark'
    });
    $mdThemingProvider.theme('default')
      .primaryPalette('primaryPalette')
      .accentPalette('primaryPalette')

    cfpLoadingBarProvider.includeSpinner = true;
    cfpLoadingBarProvider.includeBar = false;
  }
]);
