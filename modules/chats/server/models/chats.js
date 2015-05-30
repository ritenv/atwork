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

var ChatsSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  modified: {
    type: Date,
    default: Date.now
  },
  lastAccessed: [{
    accessed: {
      type: Date,
      default: Date.now
    },
    user: {
      type: Schema.ObjectId,
      required: true,
      ref: 'User'
    },
    unread: Number
  }],
  creator: {
    type: Schema.ObjectId,
    required: true,
    ref: 'User'
  },
  unread: Number,
  messages: [
    {
      created: {
        type: Date,
        default: Date.now
      },
      creator: {
        type: Schema.ObjectId,
        required: true,
        ref: 'User'
      },
      message: String
    }
  ],
  participants: [{
    type: Schema.ObjectId,
    required: false,
    ref: 'User'
  }]
});

/**
 * Methods
 */
ChatsSchema.methods = {
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
  },
  calculateUnread: function() {
    var obj = this;
    obj.lastAccessed.map(function(access) {
      access.unread = obj.messages.filter(function(msg) {
        return msg.created > access.accessed;
      }).length;
    });
  },
  calculateUnreadFor: function(user) {
    var obj = this;
    obj.lastAccessed.map(function(access) {
      if (access.user.toString() === user._id.toString()) {
        obj.unread = access.unread;
      }
    });
  },
  doAccess: function(user) {
    var chat = this;
    //change last accessed
    var lastAccessedUpdated = false;
    chat.lastAccessed.map(function(access) {
      if (access.user.toString() === user._id.toString()) {
        access.accessed = Date.now();
        lastAccessedUpdated = true;
      }
    });
    if (!lastAccessedUpdated) {
      chat.lastAccessed.push({
        user: user._id,
        accessed: Date.now()
      });
    }
  },
  notifyUsers: function(data, System) {
    var chatMessage = data.chatMessage;

    var notification = {
      chatId: data.chatId,
      chatMessage: data.chatMessage,
      actorId: data.actorId,
      notificationType: data.type,
      config: data.config
    };
    this.populate('creator participants', function(err, chat) {
      chat.participants.map(function(user) {
        /**
         * Ignore creator of message
         */
        if (user._id.toString() === chatMessage.creator._id.toString()) {
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
    });
  }
};

mongoose.model('Chat', ChatsSchema);
