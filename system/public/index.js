'use strict';

angular.module('atwork.system', ['ngRoute', 'ngMessages', 'ngResource', 'atwork.utils']);

angular.module('atwork.system')
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