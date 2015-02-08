'use strict';

angular.module('atwork.system', ['ngRoute', 'ngMessages', 'ngResource', 'atwork.utils']);

angular.module('atwork.system')
.factory('appSearch', [
  '$resource',
  function($resource) {
    var search = $resource('search/:keyword');
    return function(keyword) {
      //implement search logic here
      return keyword;
    };
  }
])