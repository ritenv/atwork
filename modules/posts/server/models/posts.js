'use strict';

/**
 * Module dependencies.
 */
var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
    crypto    = require('crypto'),
          _   = require('lodash');

/**
 * Getter
 */
var escapeProperty = function(value) {
  return _.escape(value);
};

/**
 * Post Schema
 */

var PostSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  creator: {
    type: Schema.ObjectId,
    required: true,
    ref: 'User'
  },
  content: {
    type: String,
    required: true,
    get: escapeProperty
  },
  comments: [{
    created: {
      type: Date,
      default: Date.now
    },
    content: {
      type: String,
      required: true,
      get: escapeProperty
    },
    creator: {
      type: Schema.ObjectId,
      required: true,
      ref: 'User'
    }
  }],
  likes: [{
    type: Schema.ObjectId,
    required: false,
    ref: 'User'
  }],
  liked: {
    type: Boolean,
    default: false
  }
});

/**
 * Methods
 */
PostSchema.methods = {
  /**
   * Hide security sensitive fields
   * 
   * @returns {*|Array|Binary|Object}
   */
  toJSON: function() {
    var obj = this.toObject();
    if (obj.creator) {
      delete obj.creator.token;
      delete obj.creator.hashed_password;
      delete obj.creator.salt;
      delete obj.creator.following;
    }
    if (obj.likes) {
      obj.likeCount = obj.likes.length;
    } else {
      obj.likeCount = 0;
    }
    return obj;
  },
  afterSave: function(user) {
    var obj = this;
    obj.liked = obj.likes.indexOf(user._id) != -1;
    return obj;
  },
  isAccessible: function(user, cb) {
    if (user.following.indexOf(this.creator) !== -1 && user.following.indexOf(this.creator._id) !== -1 ) {
      return true;
    } else {
      return false;
    }
  }
};

mongoose.model('Post', PostSchema);
