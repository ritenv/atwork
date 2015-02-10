'use strict';

(function() {
  var expect = chai.expect;

  // Articles Controller Spec
  describe('System', function() {
    describe('SystemServices', function() {
      beforeEach(function() {
        module('atwork.system');
      });

      // Initialize the controller and a mock scope
      var appSearch,
          appStorage,
          tokenHttpInterceptor,
          scope,
          $httpBackend,
          $stateParams,
          $location;

      // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
      // This allows us to inject a service but then attach it to a variable
      // with the same name as the service.
      beforeEach(inject(function($rootScope, _$location_, _$httpBackend_, _appSearch_, _appStorage_, _tokenHttpInterceptor_) {

        scope = $rootScope.$new();

        appSearch = _appSearch_;
        appStorage = _appStorage_;
        tokenHttpInterceptor = _tokenHttpInterceptor_;

        $httpBackend = _$httpBackend_;

        $location = _$location_;

      }));

      it('Service appSearch should be available', function() {
          expect(appSearch).to.be.a('function');
      });
      it('Service tokenHttpInterceptor should be available', function() {
          expect(tokenHttpInterceptor).to.be.a('object');
          
          var config = {headers: {}};
          appStorage.set('userToken', 'sample token');
          config = tokenHttpInterceptor.request(config);
          expect(config.headers.Authorization).to.be.a('string');
          expect(config.headers.Authorization).to.be.equal('Bearer sample token');
      });

    });
  });
}());
