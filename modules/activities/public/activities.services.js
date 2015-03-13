'use strict';

angular.module('atwork.activities')
  .factory('appActivities', ['$resource',
    function($resource) {
      return $resource('activities/feed/:userId', {
            userId: '@_id'
        });
    }
  ])
  ;
  