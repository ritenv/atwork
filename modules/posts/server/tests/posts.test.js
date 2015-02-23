'use strict';

/**
 * Load Prerequisites
 */
var expect = require('chai').expect,
  mongoose = require('mongoose'),
  Post = mongoose.model('Post')
  ;

/**
 * This will hold all temporarily added records, which will be deleted at the end of the tests
 * @type {Object}
 */
var temps = {};

describe('<Unit Test>', function() {
  describe('Model Post:', function() {
    beforeEach(function(done) {
      done();
    });

    /**
     * Save comment
     */
    describe('Method Save', function() {
      it('should be able to save a new post (placeholder)', function(done) {
        done();
      });
    });
  
    /**
     * Clean up
     */
    afterEach(function(done) {
      done();
    });

  });
});

