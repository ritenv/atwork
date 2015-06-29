'use strict';

angular.module('atwork.activities')
  .factory('appActivities', ['$resource',
    function($resource) {
      return $resource('/api/activities/feed/:userId', {
            userId: '@_id'
        });
    }
  ])
  ;
  