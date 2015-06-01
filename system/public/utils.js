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
.factory('appDialog', [
  '$mdDialog',
  function($mdDialog) {
    return $mdDialog;
  }
])
.factory('appDesktop', [
  '$rootScope',
  function($rootScope) {
    var notifBadge = 0;
    var messageBadge = 0;
    return {
      notify: function(options) {
        notifBadge = (options.notificationsCount !== undefined) ? options.notificationsCount : notifBadge;
        messageBadge = (options.messagesCount !== undefined) ? options.messagesCount : messageBadge;
        $rootScope.badges = {messageBadge: messageBadge};
        if (window.fluid) {
          window.fluid.dockBadge = notifBadge + messageBadge;
          if (parseInt(window.fluid.dockBadge) <= 0) {
            window.fluid.dockBadge = undefined;
          } else {
            window.fluid.playSound('Sosumi');
            window.fluid.playSound('Purr');
          }
        }
      }
    }
  }
])
.directive('setFocus', [
  '$timeout', '$parse',
  function($timeout, $parse) {
    return {
      //scope: true,   // optionally create a child scope
      link: function(scope, element, attrs) {
        /**
         * Set focus only if not on mobile
         */
        if ($(window).width() <= 600) {
          return true;
        }
        var model = $parse(attrs.setFocus);
        scope.$watch(model, function(value) {
          if(value === true) {
            $timeout(function() {
              element[0].focus(); 
            }, 800);
          }
        });
      }
    };
  }
])

;
