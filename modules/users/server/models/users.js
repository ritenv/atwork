'use strict';

/**
 * Module dependencies.
 */
var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
    crypto    = require('crypto'),
          _   = require('lodash'),
    fs        = require('fs');

/**
 * Validations
 */
var validatePresenceOf = function(value) {
  // If you are authenticating by any of the oauth strategies, don't validate.
  return (this.provider && this.provider !== 'local') || (value && value.length);
};

var validateUniqueEmail = function(value, callback) {
  var User = mongoose.model('User');
  User.find({
    $and: [{
      email: new RegExp('^' + value + '$', 'i')
    }, {
      _id: {
        $ne: this._id
      }
    }]
  }, function(err, user) {
    callback(err || user.length === 0);
  });
};

/**
 * Getter
 */
var escapeProperty = function(value) {
  return _.escape(value);
};

/**
 * Regexp to validate email format
 * @type {RegExp}
 */
var emailRE = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

/**
 * User Schema
 */

var UserSchema = new Schema({
  created: {
    type: Date,
    default: Date.now
  },
  name: {
    type: String,
    required: true,
    get: escapeProperty
  },
  username: {
    type: String,
    required: true,
    unique: true,
    get: escapeProperty,
    match: [/^\w+$/, 'Please enter only alphanumeric values for username']
  },
  email: {
    type: String,
    required: true,
    unique: true,
    // Regexp to validate emails with more strict rules as added in tests/users.js which also conforms mostly with RFC2822 guide lines
    match: [emailRE, 'Please enter a valid email'],
    validate: [validateUniqueEmail, 'E-mail address is already in-use']
  },
  designation: {
    type: String,
    required: false,
    get: escapeProperty
  },
  face: {
    type: String
  },
  roles: {
    type: Array,
    default: ['authenticated']
  },
  hashed_password: {
    type: String,
    validate: [validatePresenceOf, 'Password cannot be blank']
  },
  provider: {
    type: String,
    default: 'local'
  },
  following: [{
    type: Schema.ObjectId,
    required: true,
    ref: 'User'
  }],
  socketId: {
    type: String,
    default: ''
  },
  onlineStatus: {
    type: Boolean,
    default: false
  },
  loggedIn: {
    type: Boolean,
    default: false
  },
  notifications: [{
    post: {
      type: Schema.ObjectId,
      ref: 'Post'
    },
    user: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    actor: {
      type: Schema.ObjectId,
      ref: 'User'
    },
    created: {
      type: Date,
      default: Date.now
    },
    notificationType: String,
    unread: {
      type: Boolean,
      default: true
    }
  }],
  salt: String,
  token: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  facebook: {},
  twitter: {},
  github: {},
  google: {},
  linkedin: {},
  activationCode: {
    type: String
  },
  active: {
    type: Boolean,
    default: false
  }
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function(password) {
  this._password = password;
  this.salt = this.makeSalt();
  this.hashed_password = this.hashPassword(password);
  this.activationCode = Date.now().toString().substr(4, 4) + Date.now().toString().substr(6, 4) + Date.now().toString();
}).get(function() {
  return this._password;
});

/**
 * Pre-save hook
 */
UserSchema.pre('save', function(next) {
  if (this.isNew && this.provider === 'local' && this.password && !this.password.length)
    return next(new Error('Invalid password'));
  next();
});

/**
 * Methods
 */
UserSchema.methods = {

  /**
   * HasRole - check if the user has required role
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  hasRole: function(role) {
    var roles = this.roles;
    return roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1;
  },

  /**
   * IsAdmin - check if the user is an administrator
   *
   * @return {Boolean}
   * @api public
   */
  isAdmin: function() {
    return this.roles.indexOf('admin') !== -1;
  },

  /**
   * Authenticate - check if the passwords are the same
   *
   * @param {String} plainText
   * @return {Boolean}
   * @api public
   */
  authenticate: function(plainText) {
    return this.hashPassword(plainText) === this.hashed_password;
  },
  
  /**
   * Send notification to this user
   * @param  {Object} data   The data containing notification infp
   * @param  {Object} System The core system object
   * @return {Void}
   */
  notify: function(data, System) {
    data = data || {};
    data.config = data.config || {};

    /**
     * Save a ref to self
     * @type {Object}
     */
    var thisUser = this;

    /**
     * If notifications is not an object (array), initialize it
     */
    if (!thisUser.notifications || typeof thisUser.notifications !== 'object') {
      thisUser.notifications = [];
    }

    /**
     * Load the user model
     * @type {Object}
     */
    var User = mongoose.model('User');

    /**
     * Set a ref to notifications plugin
     * @type {Object}
     */
    var notifications = System.plugins.notifications;

    /**
     * Do the actual notification
     * This will be called after populating required fields in the data
     * @param  {Object} fullData Populated object containing actor and user data
     * @return {Void}
     */
    var doNotify = function (fullData) {
      /**
       * If socketId is enabled, send a push
       */
      if (thisUser.socketId) {
        //get total unread count
        var unread = thisUser.notifications.filter(function(item) {
          return item.unread;
        }).length;
        fullData.unread = unread;
        notifications.send(thisUser.socketId, fullData);

        console.log(thisUser.name, 'is notified in the browser.');

      }

      /**
       * If socketId is not enabled, send an email
       */
      if (!thisUser.socketId && !fullData.config.avoidEmail) {
        console.log(thisUser.name, 'is notified via email.');
        // 'Hi ' + user.name + ', you\'ve got a new notification on AtWork!<br><br>Check it out here: ' + '<a href="http://localhost:8111/post/' + data.postId + '">View</a>' // html body
        
        var msg = '';

        switch (fullData.notificationType) {
          case 'like':
          msg = fullData.actor.name + ' has liked a post';
          break;
          
          case 'comment':
          msg = fullData.actor.name + ' has commented on a post';
          break;
          
          case 'follow':
          msg = fullData.actor.name + ' is now following you';
          break;

          case 'mention':
          msg = fullData.actor.name + ' mentioned you in a post';

          case 'chatMessage':
          msg = fullData.actor.name + ' sent you this message: ' + (fullData.chatMessage ? fullData.chatMessage.message : '');
          break;
        }

        System.plugins.emailing.generate({
          name: thisUser.name,
          message: msg,
          action: fullData.postId ? 'View Post' : 'View Profile',
          href: fullData.postId ? System.config.baseURL + '/post/' + fullData.postId : System.config.baseURL + '/profile/' + fullData.actor.username
        }, function(html) {
          fullData.html = html;
          notifications.sendByEmail(thisUser, fullData);
        });
      }
    };

    /**
     * Populate the actor
     */
    User.findOne({_id: data.actorId}).exec(function (err, actor) {
      data.actor = actor;
      doNotify(data);
    });

    /**
     * Add the notification data to the user
     */
    if (!data.config.systemLevel) {
      thisUser.notifications.push({
        post: data.postId,
        user: data.userId,
        actor: data.actorId,
        notificationType: data.notificationType
      });
    }

    /**
     * Sort all notifications in order
     */
    thisUser.notifications.sort(function(a, b) {
      var dt1 = new Date(a.created);
      var dt2 = new Date(b.created);
      if (dt1 > dt2) {
        return -1;
      } else {
        return 1;
      }
    });

    /**
     * Save the current user
     */
    return thisUser.save(function(err, user) {
      return user;
    });
  },

  /**
   * Send a notification to all followers
   * @param  {Object} data   The notification data
   * @param  {Object} System The core system object
   * @return {Void}
   */
  notifyFollowers: function(data, System) {
    var User = mongoose.model('User');
    User.find({following: this._id}, function(err, followers) {
      followers.map(function(follower) {
        follower.notify(data, System);
      });
    });
  },

  /**
   * Make salt
   *
   * @return {String}
   * @api public
   */
  makeSalt: function() {
    return crypto.randomBytes(16).toString('base64');
  },

  /**
   * Hash password
   *
   * @param {String} password
   * @return {String}
   * @api public
   */
  hashPassword: function(password) {
    if (!password || !this.salt) return '';
    var salt = new Buffer(this.salt, 'base64');
    return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
  },

  /**
   * Hide security sensitive fields
   * 
   * @returns {*|Array|Binary|Object}
   */
  toJSON: function() {
    var obj = this.toObject();
    obj.onlineStatus = obj.socketId ? true : false;
    delete obj.socketId;
    delete obj.hashed_password;
    delete obj.notifications;
    delete obj.salt;
    delete obj.token;
    delete obj.following;
    return obj;
  }
};

mongoose.model('User', UserSchema);
