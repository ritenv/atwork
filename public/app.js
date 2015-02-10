var app = angular.module('AtWork', ['atwork.system', 'atwork.users', 'ngMaterial']);

app.controller('AppCtrl', [
  '$scope', 
  '$mdSidenav',
  '$mdBottomSheet',
  '$location',
  '$timeout',
  'appLocation',
  'appAuth',
  'appSearch',
  function($scope, $mdSidenav, $mdBottomSheet, $location, $timeout, appLocation, appAuth, appSearch) {
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

    $scope.clearSearch = function() {
      $scope.search = '';
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
      if (!newValue || !newValue.length) {
        $scope.searchResults = [];
        return false;
      }
      appSearch(newValue).then(function(response) {
        $scope.searchResults = response.res.items;
      });
    });
    $scope.updateLoginStatus();
    $timeout(function() {
      $scope.appReady = true;
    });
    // $location.url('profile/54d7745f57bf4f2b0dd6934a');
    $location.url('/me');
  }
]);