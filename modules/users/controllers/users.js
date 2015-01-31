var mongoose = require('mongoose');
var User = mongoose.model('User');

module.exports = function(System) {
  var obj = {};

  obj.create = function(req, res) {
    var user = new User(req.payload);
    user.provider = 'local';
    user.roles = ['authenticated'];

    user.save(function(err) {
      if (err) {
        return res(System.JSON.unhappy(err));
      }
      res(System.JSON.happy('User created'));
    });
  };

  return obj;
};