'use strict';
angular.module('atwork.notifications', ['atwork.system'])
.run([
  '$rootScope',
	'appLocation',
	'appNotification',
	'appWebSocket',
  'appNotificationText',
	function($rootScope, appLocation, appNotification, appWebSocket, appNotificationText) {
		appWebSocket.conn.on('notification', function (data) {
      /**
       * Broadcast the notification to the application
       */
      $rootScope.$broadcast('notification', data);
      $rootScope.$broadcast(data.notificationType, data);

      /**
       * No data will be received if it is just a notification update signal
       */
      if (!data) return;

      /**
       * Prepare to show the notification
       */
      data.message = appNotificationText(data).text;

      data.then = function () {
        if (data.postId) {
          appLocation.url('/post/' + data.postId);
        } else if (data.userId) {
          appLocation.url('/profile/' + data.actor.username);
        }
      };

      appNotification.show(data);
    });

    /**
     * A system level notification is only
     * for broadcasting to the application
     */
    appWebSocket.conn.on('system', function (data) {
      /**
       * Broadcast the notification to the application
       */
      $rootScope.$broadcast(data.notificationType, data);
    });
	}
]);