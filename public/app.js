var app = angular.module('AtWork', ['atwork.system', 'atwork.users', 'atwork.posts', 'atwork.activities', 'ngMaterial']);

app.controller('AppCtrl', [
  '$scope', 
  '$mdSidenav',
  '$mdBottomSheet',
  '$location',
  '$timeout',
  'appLocation',
  'appAuth',
  'appWebSocket',
  function($scope, $mdSidenav, $mdBottomSheet, $location, $timeout, appLocation, appAuth, appWebSocket) {
    $scope.barTitle = '';
    $scope.search = '';

    $scope.toggleSidenav = function(menuId) {
      $mdSidenav(menuId).toggle();
    };

    $scope.updateLoginStatus = function() {
      $scope.isLoggedIn = appAuth.isLoggedIn();
      $scope.user = appAuth.getUser();
    };

    $scope.goHome = function() {
      appLocation.url('/feed');
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

    $scope.$on('loggedIn', function() {
      $scope.updateLoginStatus();
      $scope.barTitle = '';
      appWebSocket.emit('online', {token: appAuth.getToken()});
    });
    $scope.$on('loggedOut', function() {
      $scope.updateLoginStatus();
      $scope.barTitle = 'atWork';
    });
    appWebSocket.on('connect', function() {
      if (appAuth.isLoggedIn()) {
        appWebSocket.emit('online', {token: appAuth.getToken()});
      }
    });

    
    $scope.updateLoginStatus();
    $timeout(function() {
      $scope.appReady = true;
      if (!appAuth.isLoggedIn()) {
        $scope.barTitle = 'atWork';
        appLocation.url('/login');
      } else {
        $scope.barTitle = '';
        $scope.$broadcast('loggedIn');
      }
      
    });
  }
]);