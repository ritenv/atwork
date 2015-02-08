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
    if (req.user.following.indexOf(req.body.userId) !== -1) {
      return json.unhappy('You are already following', res);
    }
    User.findOne({_id: req.body.userId}, function(err, user) {
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

  obj.me = function(req, res) {
    if (req.user) {
      json.happy({
        record: req.user,
        token: req.token
      }, res);
    }
  };

  return obj;
};