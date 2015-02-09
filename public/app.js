var app = angular.module('AtWork', ['atwork.system', 'atwork.users', 'ngMaterial']);

app.controller('AppCtrl', [
  '$scope', 
  '$mdSidenav',
  '$mdBottomSheet',
  'appLocation',
  'appAuth',
  'appSearch',
  function($scope, $mdSidenav, $mdBottomSheet, appLocation, appAuth, appSearch) {
    $scope.barTitle = '';
    $scope.search = '';

    $scope.toggleSidenav = function(menuId) {
      $mdSidenav(menuId).toggle();
    };

    $scope.updateLoginStatus = function() {
      $scope.isLoggedIn = appAuth.isLoggedIn();
      $scope.user = appAuth.getUser();
    };

    $scope.showUserActions = function($event) {
      $mdBottomSheet.show({
        templateUrl: '/modules/users/views/user-list.html',
        controller: 'UserSheet',
        targetEvent: $event
      }).then(function(clickedItem) {
        $scope.alert = clickedItem.name + ' clicked!';
      });
    };

    if (!appAuth.isLoggedIn()) {
      $scope.barTitle = 'atWork';
      appLocation.url('/login');
    } else {
      $scope.barTitle = '';
    }
    $scope.$on('loggedIn', function() {
      $scope.updateLoginStatus();
      $scope.barTitle = '';
      
    });
    $scope.$on('loggedOut', function() {
      $scope.updateLoginStatus();
      $scope.barTitle = 'atWork';
    });

    $scope.search = '';
    $scope.$watch('search', function(newValue, oldValue) {
      if (newValue.length < 3) {
        $scope.searchResults = [];
        return false;
      }
      appSearch(newValue).then(function(response) {
        $scope.searchResults = response.res.items;
      });
    });
    $scope.updateLoginStatus();
  }
]);