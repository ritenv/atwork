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
    if (obj.likes) {
      obj.likeCount = obj.likes.length;
    } else {
      obj.likeCount = 0;
    }
    return obj;
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
