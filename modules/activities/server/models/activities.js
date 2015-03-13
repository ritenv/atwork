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
 * Activity Schema
 */

var ActivitySchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  actor: {
    type: Schema.ObjectId,
    required: true,
    ref: 'User'
  },
  post: {
    type: Schema.ObjectId,
    required: false,
    ref: 'Post'
  },
  action: {
    type: String,
    required: true,
    get: escapeProperty
  }
});

/**
 * Methods
 */
ActivitySchema.methods = {
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
    return obj;
  }
};

mongoose.model('Activity', ActivitySchema);
