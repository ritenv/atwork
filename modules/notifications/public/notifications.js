'use strict';
angular.module('atwork.notifications', ['atwork.system'])
.run([
  '$rootScope',
	'appLocation',
	'appNotification',
	'appWebSocket',
	function($rootScope, appLocation, appNotification, appWebSocket) {
		appWebSocket.on('notification', function (data) {
      $rootScope.$broadcast('notification', data);
			if (data.notificationType === 'like') {
				data.message = 'Your post has been liked.';
			} else if (data.notificationType === 'comment') {
				data.message = 'There is a new comment.';
			}
			data.then = function () {
				appLocation.url('/post/' + data.postId);
			};

			appNotification.show(data);
		});
	}
]);