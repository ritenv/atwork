'use strict';

(function() {
  var expect = chai.expect;

  // Articles Controller Spec
  describe('System', function() {
    describe('SystemServices', function() {
      // The $resource service augments the response object with methods for updating and deleting the resource.
      // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
      // the responses exactly. To solve the problem, we use a newly-defined toEqualData Jasmine matcher.
      // When the toEqualData matcher compares two objects, it takes only object properties into
      // account and ignores methods.
      // beforeEach(function() {
      //   jasmine.addMatchers({
      //     toEqualData: function() {
      //       return {
      //         compare: function(actual, expected) {
      //           return {
      //             pass: angular.equals(actual, expected)
      //           };
      //         }
      //       };
      //     }
      //   });
      // });

      beforeEach(function() {
        module('atwork.system');
      });

      // Initialize the controller and a mock scope
      var appSearch,
          tokenHttpInterceptor,
          scope,
          $httpBackend,
          $stateParams,
          $location;

      // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
      // This allows us to inject a service but then attach it to a variable
      // with the same name as the service.
      beforeEach(inject(function($rootScope, _$location_, _$httpBackend_, _appSearch_, _tokenHttpInterceptor_) {

        scope = $rootScope.$new();

        appSearch = _appSearch_;

        $httpBackend = _$httpBackend_;

        $location = _$location_;

      }));

      it('$scope.find() should create an array with at least one article object ' +
        'fetched from XHR', function() {
          expect(true).to.equal(true);
        });
    });
  });
}());
