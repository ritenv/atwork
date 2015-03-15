'use strict';

angular.module('atwork.utils', ['ngRoute', 'ngMaterial'])
.factory('appStorage', function() {
  return {
    get: function(item) {
      return localStorage.getItem(item);
    },
    set: function(item, val) {
      return localStorage.setItem(item, val);
    },
    remove: function(item) {
      return localStorage.removeItem(item);
    }
  }
})
.factory('appPromise', [
  function() {
    return function(fn) {
      var deferred = Q.defer();
      fn(deferred);
      return deferred.promise;
    }
  }
])
.factory('appLocation', [
  '$location', 
  function($location) {
    return $location;
  }
])
.factory('appWebSocket', [
  function($location) {
    var socket = window.io();
    socket.on('connect', function() {
      console.log('Connected');
    });
    socket.on('disconnect', function() {
      console.log('Disonnected');
    });
    return socket;
  }
])
.factory('appToast', [
  '$mdToast',
  function($mdToast) {
    return function(message) {
      var toast = $mdToast.simple()
        .content(message)
        .action('OK')
        .highlightAction(false)
        .position('top right');
      $mdToast.show(toast);
    }
  }
]);
