'use strict';

angular.module('atwork.users', ['atwork.system'])
  .factory('theUser', [
    'appStorage',
    function(appStorage) {
      return appStorage.get('userToken');
    }
  ]);
