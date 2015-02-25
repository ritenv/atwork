var mongoose = require('mongoose');
var User = mongoose.model('User');
var jwt = require('jsonwebtoken');

module.exports = function(System) {
  var obj = {};
  var json = System.plugins.JSON;

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

  obj.me = function(req, res) {
    if (req.user) {
      json.happy({
        record: req.user,
        token: req.token
      }, res);
    }
  };

  obj.search = function(req, res) {
    var keyword = req.param('keyword');
    User.find({name: new RegExp(keyword, 'ig')}, null, {sort: {name: 1}}).exec(function(err, items) {
      if (err) {
        return json.unhappy(err, res);
      }
      return json.happy({ items: items }, res);
    });
  };

  return obj;
};