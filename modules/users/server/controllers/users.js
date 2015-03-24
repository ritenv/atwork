var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('jsonwebtoken');

module.exports = function(System) {
  var obj = {};
  var json = System.plugins.JSON;

  var sck = System.webSocket;

  /**
   * User related socket emmissions
   */
  sck.on('connection', function(socket){
    socket.on('online', function(data) {
      User.findOne({token: data.token}, function(err, user) {
        if (user) {
          socket.userId = user._id;
          user.socketId = socket.id;
          user.loggedIn = true;
          user.save(function(err) {
            console.log(user.name, 'is online.');
          });
        }
      });
    });
    socket.on('disconnect', function(data) {
      User.findOne({_id: socket.userId}, function(err, user) {
        if (user) {
          delete socket.userId;
          user.socketId = '';
          user.loggedIn = false;
          user.save(function(err) {
            console.log(user.name, 'disconnected.');
          });
        }
      });
    });

  });

  /**
   * Create / register a new user
   * @param  {Object} req Request
   * @param  {Object} res Request
   * @return {Void}     
   */
  obj.create = function(req, res) {

    var user = new User(req.body);
    user.provider = 'local';
    user.roles = ['authenticated'];
    user.token = jwt.sign(user, System.config.secret);

    user.save(function(err) {
      if (err) {
        return json.unhappy(err, res);
      }
      return json.happy(user, res);
    });
  };

  /**
   * Modify an existing user
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.modify = function (req, res) {
    var user = req.user;
    user.name = req.body.name;
    user.designation = req.body.designation;
    user.save(function(err) {
      if (err) {
        return json.unhappy(err, res);
      }
      return json.happy(user, res);
    });
  };
  
  /**
   * Check if the user credentials are valid
   * @param  {Object} req Request
   * @param  {Object} res Response
   * @return {Void}
   */
  obj.authenticate = function(req, res) {
    User.findOne({email: req.body.email}, function(err, user) {
      if (err) {
        json.unhappy(err, res);
      } else {
        if (user && user.hashPassword(req.body.password) === user.hashed_password) {
          json.happy({
            record: user,
            token: user.token
          }, res);
        } else {
          json.unhappy({
            message: 'Incorrect email/password'
          }, res);
        }
      }
    });
  };

  /**
   * List all users
   * @param  {Object} req Request
   * @param  {Object} res Response
   * @return {Void}     
   */
  obj.list = function(req, res) {
    //TODO: pagination
    User.find({}, function(err, users) {
      if (err) {
        json.unhappy(err, res);
      } else {
        json.happy({
          records: users
        }, res);
      }
    });
  };

  /**
   * Follow a user not already following
   * @param  {Object} req Request
   * @param  {Object} res Response
   * @return {Void}     
   */
  obj.follow = function(req, res) {
    var currUser = req.user;
    var toFollow = req.param('userId');
    
    if (req.user.following.indexOf(toFollow) !== -1) {
      return json.unhappy('You are already following', res);
    }

    User.findOne({_id: toFollow}, function(err, user) {
      if (err) {
        json.unhappy(err, res);
      } else {
        currUser.following.push(user._id);
        currUser.save(function(err, item) {
          if (err) {
            return json.unhappy(err, res);
          }
          json.happy({
            record: item
          }, res);
        });
      }
    });
  };

  /**
   * Stop following an already following user
   * @param  {Object} req Request
   * @param  {Object} res Response
   * @return {Void}     
   */
  obj.unfollow = function(req, res) {
    var currUser = req.user;
    var toUnFollow = req.param('userId');

    if (req.user.following.indexOf(toUnFollow) == -1) {
      return json.unhappy('You are already not following', res);
    }

    User.findOne({_id: toUnFollow}, function(err, user) {
      if (err) {
        json.unhappy(err, res);
      } else {
        currUser.following.splice(currUser.following.indexOf(user._id), 1);
        currUser.save(function(err, item) {
          if (err) {
            return json.unhappy(err, res);
          }
          json.happy({
            record: item
          }, res);
        });
      }
    });
  };

  /**
   * Upload a user's face
   * @param  {Object} req Request
   * @param  {Object} res Response
   * @return {Void}     
   */
  obj.avatar = function(req, res) {
    var user = req.user;
    var file = req.files.file;
    if (['png', 'jpg', 'jpeg', 'gif'].indexOf(file.extension) === -1) {
      return json.unhappy({message: 'Only images allowed.'}, res);
    }
    user.face = file.path.replace('public/', '');
    user.save(function(err, u) {
      if (err) {
        return json.unhappy(err, res);
      }
      return json.happy({
        face: u.face
      }, res);
    });
  };

  /**
   * Return a single user as json
   * @param  {Object} req Request
   * @param  {Object} res Response
   * @return {Void}     
   */
  obj.single = function(req, res) {
    User.findOne({_id: req.param('userId')}).populate('following').exec(function(err, user) {
      if (err) {
        return json.unhappy(err, res);
      } else if (user) {
        //now get followers
        return User.find({following: user._id}, function(err, followers) {
          if (err) {
            return json.unhappy(err, res);
          }
          return json.happy({
            record: user,
            followers: followers,
            following: user.following,
            alreadyFollowing: (req.user.following.indexOf(user._id) != -1)
          }, res);
        });
      } else {
        return json.unhappy({message: 'User not found'}, res);
      }
    });
  };

  /**
   * Return a single user's notification
   * @param  {Object} req Request
   * @param  {Object} res Response
   * @return {Void}     
   */
  obj.notifications = function(req, res) {
    User.findOne({_id: req.user._id, 'notifications.unread': true})
    .lean()
    .populate('notifications')
    .populate('notifications.post')
    .populate('notifications.user')
    .exec(function(err, user) {
      if (err) {
        return json.unhappy(err, res);
      } else if (user) {
        user.notifications = user.notifications.filter(function(item) {
          return item.unread;
        });
        return json.happy({
          record: user,
          notifications: user.notifications.slice(0, 10)
        }, res);
      } else {
        return json.happy({message: 'No unread notifications.'}, res);
      }
    });
  };

  /**
   * Return a single user's notification
   * @param  {Object} req Request
   * @param  {Object} res Response
   * @return {Void}     
   */
  obj.markRead = function(req, res) {
    User.findOne({_id: req.user._id, 'notifications.unread': true})
    .populate('notifications')
    .populate('notifications.post')
    .populate('notifications.user')
    .exec(function(err, user) {
      if (err) {
        return json.unhappy(err, res);
      } else if (user) {
        //now get followers
        user.notifications.map(function(item) {
          if (item._id.toString() === req.params.notificationId) {
            item.unread = false;
          }
        });
        user.save(function () {
          user.notifications = user.notifications.filter(function(item) {
            return item.unread;
          });
          return json.happy({
            notifications: user.notifications.slice(0, 10)
          }, res);
        });
      } else {
        return json.happy({message: 'Already marked as unread.'}, res);
      }
    });
  };

  /**
   * Self as json
   * @param  {Object} req Request
   * @param  {Object} res Response
   * @return {Void}     
   */
  obj.me = function(req, res) {
    if (req.user) {
      json.happy({
        record: req.user,
        token: req.token
      }, res);
    }
  };

  /**
   * Search users by full name
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.search = function(req, res) {
    var keyword = req.param('keyword');
    User.find({name: new RegExp(keyword, 'ig'), _id: {$ne: req.user._id}}, null, {sort: {name: 1}}).exec(function(err, items) {
      if (err) {
        return json.unhappy(err, res);
      }
      return json.happy({ items: items }, res);
    });
  };

  return obj;
};