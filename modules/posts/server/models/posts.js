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
  subscribers: [{
    type: Schema.ObjectId,
    required: false,
    ref: 'User'
  }],
  likes: [{
    type: Schema.ObjectId,
    required: false,
    ref: 'User'
  }],
  liked: {
    type: Boolean,
    default: false
  },
  hasMoreComments: {
    type: Number,
    default: 0
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
  afterSave: function(user, limitComments) {
    var obj = this;
    obj.liked = obj.likes.indexOf(user._id) != -1;
    if (limitComments && obj.comments && obj.comments.length > 3) {
      obj.hasMoreComments = obj.comments.length - 3;
      obj.comments = obj.comments.slice(0, 3);
    }
    return obj;
  },
  subscribe: function(userId) {
    if (this.subscribers.indexOf(userId) === -1 && this._id !== userId) { //cannot subscribe to own post
      this.subscribers.push(userId);
    }
  },
  notifyUsers: function(data, System) {
    // var User = mongoose.model('User');
    var notification = {
      postId: this._id,
      userId: data.userId,
      type: data.type
    };
    this.populate('creator subscribers', function(err, post) {
      post.subscribers.map(function(user) {
        user.notify(notification, System);
      });
      post.creator.notify(notification, System);
    });
  }
};

mongoose.model('Post', PostSchema);
