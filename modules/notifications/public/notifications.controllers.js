'use strict';
angular.module('atwork.notifications')
.controller('notificationsCtrl', [
  '$scope',
	'appLocation',
	'appUsers',
	'appNotification',
	'appWebSocket',
	function($scope, appLocation, appUsers, appNotification, appWebSocket) {
    $scope.notificationShown = false;
    $scope.items = [];

		$scope.showUserNotifications = function($event) {
		  $scope.notificationShown = !$scope.notificationShown;
		};

    var user = appUsers.single.get({}, function () {
      console.log(user);
    });

	}
]);