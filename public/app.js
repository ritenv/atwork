var app = angular.module('AtWork', ['atwork.system', 'atwork.users', 'ngMaterial']);

app.controller('AppCtrl', [
  '$scope', 
  '$mdSidenav', 
  'appLocation',
  'appAuth',
  'appSearch',
  function($scope, $mdSidenav, appLocation, appAuth, appSearch) {
    $scope.barTitle = 'Welcome';
    $scope.search = '';

    $scope.toggleSidenav = function(menuId) {
      $mdSidenav(menuId).toggle();
    };
    if (!appAuth.isLoggedIn()) {
      $scope.barTitle = 'atWork';
      appLocation.url('/login');
    } else {
      $scope.barTitle = 'Welcome';
    }
    $scope.$on('loggedIn', function() {
      $scope.isLoggedIn = appAuth.isLoggedIn();
      $scope.barTitle = 'Welcome';
    });
    $scope.$on('loggedOut', function() {
      $scope.isLoggedIn = appAuth.isLoggedIn();
      $scope.barTitle = 'atWork';
    });

    $scope.search = '';
    $scope.$watch('search', function(newValue, oldValue) {
      // $scope.searchResults = appSearch(newValue);
      console.log(newValue);
    });

    $scope.isLoggedIn = appAuth.isLoggedIn();
  }
]);