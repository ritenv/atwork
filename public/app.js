var app = angular.module('AtWork', ['atwork.system', 'atwork.users', 'ngMaterial']);

app.controller('AppCtrl', [
  '$scope', 
  '$mdSidenav', 
  'appLocation',
  'theUser',
  function($scope, $mdSidenav, appLocation, theUser) {
    $scope.barTitle = 'Welcome';
    $scope.toggleSidenav = function(menuId) {
      $mdSidenav(menuId).toggle();
    };
    if (!theUser) {
      $scope.barTitle = 'Register or Login';
      appLocation.url('/login');
    }
  }
]);