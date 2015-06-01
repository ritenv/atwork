'use strict';
angular.module('atwork.notifications')
.controller('notificationsCtrl', [
  '$scope',
  '$rootScope',
	'appLocation',
	'appUsers',
	'appNotification',
	'appWebSocket',
  'appNotificationText',
  'appDesktop',
	function($scope, $rootScope, appLocation, appUsers, appNotification, appWebSocket, appNotificationText, appDesktop) {
    /**
     * Initialize the defaults
     */
    $scope.notificationShown = false;
    $scope.notificationCount = 0;
    $scope.items = [];

    /**
     * The event will be broadcasted when new notifications are received
     */
    $rootScope.$on('notification', function(e, data) {
      $scope.updateNotifications();
    });

    /**
     * Hide or show notifications box
     * @param  {Object} $event 
     * @return {Void}        
     */
		$scope.showUserNotifications = function($event) {
		  $scope.notificationShown = !$scope.notificationShown;
		};

    /**
     * Mark notification as read
     * @param  {Object} item The item object
     * @return {Void}
     */
    $scope.markRead = function (item) {
      var record = appUsers.notifications.get({notificationId: item._id}, function () {
        if (record.res.notifications) {
          record.res.notifications.map(function (item) {
            item.display = appNotificationText(item);
          });
        }
        $scope.items = record.res.notifications;
        $scope.notificationCount = record.res.notifications.length;
      });
      $scope.showUserNotifications();
    };

    /**
     * Get notifications 
     * @return {Void}
     */
    $scope.updateNotifications = function () {
      var record = appUsers.notifications.get({}, function () {
        if (record.res.notifications) {
          record.res.notifications.map(function (item) {
            item.display = appNotificationText(item);
            if (item.post) {
              item.href = '/post/' + item.post._id
            } else if (item.user) {
              item.href = '/profile/' + item.actor.username
            }
          });
        }
        $scope.items = record.res.notifications;
        $scope.notificationCount = record.res.notifications ? record.res.notifications.length : 0;
        appDesktop.notify({notificationsCount: $scope.notificationCount});
        // if (window.fluid) {
        //   window.fluid.dockBadge = $scope.notificationCount ? $scope.notificationCount : undefined;
        //   if (window.fluid.dockBadge) {
        //     window.fluid.playSound('Sosumi');
        //     window.fluid.playSound('Purr');
        //   }
        // }
      });
    };

    /**
     * Get initial notifications on load
     */
    $scope.updateNotifications();

	}
]);