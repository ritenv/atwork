'use strict';
angular.module('atwork.notifications')
.controller('notificationsCtrl', [
  '$scope',
	'appLocation',
	'appUsers',
	'appNotification',
	'appWebSocket',
	function($scope, appLocation, appNotification, appWebSocket) {
    $scope.notificationShown = false;
		$scope.showUserNotifications = function($event) {
		  $scope.notificationShown = !$scope.notificationShown;
		};
	}
]);