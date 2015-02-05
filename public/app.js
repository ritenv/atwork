var app = angular.module('AtWork', ['atwork.system', 'atwork.users', 'ngMaterial']);

app.controller('AppCtrl', [
  '$scope', 
  '$mdSidenav', 
  'appLocation',
  'appAuth',
  function($scope, $mdSidenav, appLocation, appAuth) {
    $scope.barTitle = 'Welcome';
    $scope.toggleSidenav = function(menuId) {
      $mdSidenav(menuId).toggle();
    };
    if (!appAuth.isLoggedIn()) {
      $scope.barTitle = 'Register or Login';
      appLocation.url('/login');
    }
    $scope.$on('loggedIn', function() {
      $scope.isLoggedIn = appAuth.isLoggedIn();
    });
    $scope.$on('loggedOut', function() {
      $scope.isLoggedIn = appAuth.isLoggedIn();
    });

    $scope.isLoggedIn = appAuth.isLoggedIn();
  }
]);