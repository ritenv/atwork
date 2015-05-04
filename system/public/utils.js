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
    var obj = {
      conn: {},
      connect: function() {
        var $this = this;
        var socket = window.io();
        socket.on('connect', function() {
          console.log('Connected');
        });
        socket.on('disconnect', function() {
          $this.connect();
        });
        this.conn = socket;
      },
      reconnect: function() {
        this.conn.close();
        this.connect();
      },
      close: function() {
        this.conn.close();
      }
    };
    obj.connect();
    return obj;
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
])
.directive('setFocus', function($timeout, $parse) {
  return {
    //scope: true,   // optionally create a child scope
    link: function(scope, element, attrs) {
      var model = $parse(attrs.setFocus);
      scope.$watch(model, function(value) {
        if(value === true) {
          $timeout(function() {
            element[0].focus(); 
          });
        }
      });
    }
  };
})
;
