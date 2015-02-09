'use strict';

angular.module('atwork.system', ['ngRoute', 'ngMessages', 'ngResource', 'atwork.utils']);

angular.module('atwork.system')
.factory('appSearch', [
  '$resource',
  'appPromise',
  function($resource, appPromise) {
    var search = $resource('search/:keyword');
    return function(keyword) {
      //implement search logic here
      // return appPromise(function(deferred) {
      //   deferred.resolve([
      //     {
      //       name: 'riten',
      //       email: 'ritenvs@gmail.com',
      //       face: '/images/user.jpg'
      //     }
      //   ]);
      // });
      // console.log('Searching...');
      // var deferred = Q.defer();
      // setTimeout(function() {
      //   deferred.resolve([
      //     {
      //       name: 'riten',
      //       email: 'ritenvs@gmail.com',
      //       face: '/images/user.jpg'
      //     }
      //   ]);
      //   console.log("Done");
      // }, 2000);
      // // return deferred.promise;
      return [
          {
            name: 'riten',
            email: 'ritenvs@gmail.com',
            face: '/images/user.jpg'
          }
        ];
    };
  }
])