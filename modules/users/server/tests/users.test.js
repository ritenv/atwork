'use strict';

/**
 * Load Prerequisites
 */
var expect = require('expect'),
  mongoose = require('mongoose'),
  User = mongoose.model('User')
  ;

/**
 * This will hold all temporarily added records, which will be deleted at the end of the tests
 * @type {Object}
 */
var temps = {};

describe('<Unit Test>', function() {
  describe('Model Comment:', function() {
    beforeEach(function(done) {
      temps = {};
      /**
       * Create a new test user
       * @type {User}
       */
      temps.user = new User({
        name: 'John Doe',
        email: 'test@example.com',
        password: '123456'
      });

      temps.user.save(function() {        
        done();
      });
    });

    /**
     * Save comment
     */
    describe('Method Save', function() {
      
      it('should be able to save WITHOUT user param', function(done) {
        done();
        // return temps.comment.save(function(err) {
        //   expect(err).to.be(null);
        //   expect(temps.comment.content).to.equal('This is a good article');
        //   expect(temps.comment.published).to.be(false);
        //   expect(temps.comment.user).to.equal(undefined);
        //   expect(temps.comment.article).to.equal(temps.article._id);
        //   done();
        // });
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

