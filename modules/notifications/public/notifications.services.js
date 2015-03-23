'use strict';

angular.module('atwork.notifications')
  .factory('appNotification', [
  	'$resource',
  	'$mdToast',
    function($resource, $mdToast) {
      return {
        show: function(data) {
        	var toast = $mdToast.simple()
        	  .content(data.message)
        	  .action('VIEW')
        	  .highlightAction(false)
        	  .position('top right');
        	$mdToast.show(toast).then(function() {
        		if (data.then) {
        			data.then();
        		}
        	});
        }
      }
    }
  ])
  ;
  