'use strict';

angular.module('atwork.utils', ['ngRoute'])
.factory('appStorage', function() {
  return {
    get: function(item) {
      return sessionStorage.getItem(item);
    },
    set: function(item, val) {
      return sessionStorage.setItem(item, val);
    }
  }
})
.factory('appLocation', [
  '$location', 
  function($location) {
    return $location;
  }
]);
