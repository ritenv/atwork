var ensureAuthorized = function(req, res, next) {
  var mongoose = require('mongoose');
  var User = mongoose.model('User');

  var bearerToken;
  var bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== 'undefined') {
    var bearer = bearerHeader.split(" ");
    bearerToken = bearer[1];
    req.token = bearerToken;
    //populate({path: 'following', select: 'name email'}).
    
    User.findOne({token: req.token})
    .populate('following')
    .exec(function(err, user) {
      if (err || !user) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(403);
  }
};

var justGetUser = function(req, res, next) {
  var mongoose = require('mongoose');
  var User = mongoose.model('User');
  var bearerToken;
  var bearerHeader = req.headers["authorization"];
  if (typeof bearerHeader !== 'undefined') {
    var bearer = bearerHeader.split(" ");
    bearerToken = bearer[1];
    req.token = bearerToken;
    //populate({path: 'following', select: 'name email'}).
    
    User.findOne({token: req.token}).exec(function(err, user) {
      if (user) {
        req.user = user;
      }
      next();
    });
  }
};

module.exports = function(System) {
  var plugin = {
    /**
     * The helper register method
     * @return {Void}
     */
    register: function () {
      return {
        ensureAuthorized: ensureAuthorized,
        justGetUser: justGetUser
      };
    }
  };

  /**
   * Attributes to identify the plugin
   * @type {Object}
   */
  plugin.register.attributes = {
    name: 'Auth Helper',
    key: 'auth',
    version: '1.1.0'
  };
  return plugin;
};