'use strict';

angular.module('atwork.settings')
  .factory('appSettings', ['$resource',
    function($resource) {
      return {
        cache: [],
        single: $resource('system-settings/')
      }
    }
  ])
  
  ;
  