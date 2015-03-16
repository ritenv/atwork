'use strict';

/**
 * Load Prerequisites
 */
var expect = require('chai').expect,
  mongoose = require('mongoose'),
  User = mongoose.model('User')
  ;

/**
 * This will hold all temporarily added records, which will be deleted at the end of the tests
 * @type {Object}
 */
var temps = {};

describe('<Unit Test>', function() {
  describe('Model User:', function() {
    beforeEach(function(done) {
      temps = {};
      /**
       * Create a new test user
       * @type {User}
       */
      temps.user = new User({
        name: 'John Doe',
        email: 'test@asdf.com',
        username: 'test123',
        password: 'password',
        provider: 'local',
        roles: ['authenticated']
      });

      done();
    });

    /**
     * Save comment
     */
    describe('Method Save', function() {
      
      it('should be able to save a new user', function(done) {
        temps.user.save(function(err, user) {
          expect(user.name).to.be.equal('John Doe');
          done();
        });
      });
      
    });
  

    /**
     * Clean up
     */
    afterEach(function(done) {
      var remove = function(item, ok) {
        if (item && typeof item.remove === "function") {
          item.remove(ok);
        } else {
          ok();
        }
      };
      remove(temps.user, function() {
        done();
      });
    });

  });
});

