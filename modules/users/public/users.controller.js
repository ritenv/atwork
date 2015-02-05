'use strict';

angular.module('atwork.users')
  .controller('LoginCtrl', ['$scope', 'theUser', function($scope, theUser) {
    if (theUser) {
      window.alert('Already logged in');
    } else {
      console.log(theUser);
    }
  }]);
