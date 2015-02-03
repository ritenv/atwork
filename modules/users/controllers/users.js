var mongoose = require('mongoose');
var User = mongoose.model('User');
module.exports = function(System) {
  var obj = {};
  var json = System.plugins.JSON;

  obj.create = function(req, res) {

    var user = new User(req.body);
    user.provider = 'local';
    user.roles = ['authenticated'];

    user.save(function(err) {
      if (err) {
        return json.unhappy(err, res);
      }
      return json.happy(user, res);
    });
  };
  return obj;
};