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
  stream: {
    type: Schema.ObjectId,
    required: false,
    ref: 'Stream'
  },
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
  getMentionedUsers: function(cb) {
    /**
     * Mention format will be @xyz
     */
    var re = /@([A-Za-z0-9_]+)/g;

    /**
     * Try to find the usernames
     * @type {Array}
     */
    var usernames = this.content.match(re);

    if (!usernames || !usernames.length) {
      return [];
    }
    
    /**
     * Remove the '@' symbol
     */
    usernames.map(function(username, i) {
      usernames[i] = username.substring(1);
    });

    /**
     * Find in the db
     */
    var User = mongoose.model('User');
    
    User.find({username: {$in: usernames} })
    .exec(function(err, users) {
      if (cb) {
        cb(err, users);
      }
    });
  },
  subscribe: function(userId) {
    if (this.subscribers.indexOf(userId) === -1 && this._id !== userId) { //cannot subscribe to own post
      this.subscribers.push(userId);
    }
  },
  notifyUsers: function(data, System) {
    
    var notification = {
      postId: this._id,
      actorId: data.actorId,
      notificationType: data.type,
      config: data.config
    };
    this.populate('creator subscribers', function(err, post) {
      post.subscribers.map(function(user) {
        /**
         * Ignore creator, because we have a special call for that later
         */
        if (user._id.toString() === post.creator._id.toString()) {
          return;
        }
        /**
         * Ignore the person taking this action
         */
        if (user._id.toString() === data.actorId.toString()) {
          return;
        }
        /**
         * Notify
         */
        user.notify(notification, System);
      });

      /**
       * Notify creator, if its not the creator taking this action
       */
      if (post.creator._id.toString() !== data.actorId.toString()) {
        post.creator.notify(notification, System);
      }
    });
  }
};

mongoose.model('Post', PostSchema);
