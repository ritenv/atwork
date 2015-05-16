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

    cfpLoadingBarProvider.includeSpinner = true;
    cfpLoadingBarProvider.includeBar = false;
  }
]);
