'use strict';

/**
 * Load Prerequisites
 */
var expect = require('chai').expect,
  mongoose = require('mongoose'),
  Post = mongoose.model('Post'),
  User = mongoose.model('User')
  ;

/**
 * System is available as a global object for testing purposes
 * @type {Object}
 */
var System = global.System;

var myController = require('../controllers/posts');
var posts = myController(System);
var samplePosts = [];

/**
 * This will hold all temporarily added records, which will be deleted at the end of the tests
 * @type {Object}
 */
var temps = {};
var user = {};

describe('<Unit Test>', function() {
  describe('Model Post:', function() {

    beforeEach(function(done) {
      temps = {};
      user = new User({
        name: 'Full name',
        email: 'test@test.com',
        username: 'user',
        password: 'password'
      });

      user.save(function() {
        done();
      });
      
    });

    /**
     * Save comment
     */
    describe('Method Save', function() {
      it('should be able to save a new post (placeholder)', function(done) {
        expect(posts).respondTo('create');

        var sampleRequest = {
          user: user,
          body: {
            content: 'Sample post for testing'
          }
        };
        posts.create(sampleRequest, {
          send: function(output) {
            expect(output.success).to.equal(1);
            samplePosts.push(output.res._id);
            done();
          }
        });
      });
    });

    afterEach(function(done) {
      var removed = 0;
      var toRemove = samplePosts.length;
      for (var i in samplePosts) {
        Post.remove({_id: samplePosts[i]}, function() {
          removed++;
          if (removed == toRemove) {
            user.remove(function() {
              done();
            });
          }
        });
      };
    });
  

  });
});

