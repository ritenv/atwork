'use strict';

angular.module('atwork.system', [
  'ngRoute', 
  'ngMessages', 
  'ngResource', 
  'angularFileUpload', 
  'atwork.utils',
  // 'angular-loading-bar', 
  'ngAnimate'
]);

angular.module('atwork.system')
.factory('tokenHttpInterceptor', [
  'appStorage',
  '$timeout',
  'appWebSocket',
  function (appStorage, $timeout, appWebSocket) {
    // var 
    return {
      responseError: function(response) {
        var q = Q.defer();
        
        (function(response) {
          var config = response.config;

          appWebSocket.conn.on('response', onResponse);
          function onResponse(data) {
            if (data.resId === config.reqId) {
              console.log('Got', config.reqId, config.url, data.data);
              
              if (typeof data.data !== 'string') {
                response.data = data.data;
                response.reason = 'socket';
              }
              
              q.resolve(response);
              appWebSocket.conn.removeListener('response', onResponse);
            }
          }
        })(response);

        return q.promise;
      },
      request: function (config) {
        /**
         * Add Auth header to Request
         * @type {String}
         */
        config.headers.Authorization = 'Bearer ' + appStorage.get('userToken');

        /**
         * Check if not an API request
         */
        if (config.url.indexOf('/api/') === -1) {
          return config;
        }

        /**
         * Cache everything
         * @type {Boolean}
         */
        config.cached = true;

        var q = Q.defer();

        /**
         * Send a request identifier
         * @type {String}
         */
        config.reqId = 'REQUEST' + Math.round(Math.random() * 100000000000);

        appWebSocket.conn.emit('request', config);

        $timeout(function() {
          q.reject({config: config});
        });
        return q.promise;

        // return config;
      }
    };
  }
])
.factory('appSearch', [
  '$resource',
  function($resource) {
    var search = $resource('/api/search/:keyword', {}, {query: {isArray: false}});
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
  // 'cfpLoadingBarProvider',
  function ($httpProvider, $mdThemingProvider) {
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

    // cfpLoadingBarProvider.includeSpinner = true;
    // cfpLoadingBarProvider.includeBar = false;
  }
]);
