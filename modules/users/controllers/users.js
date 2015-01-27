var mongoose = require('mongoose');
var User = mongoose.model('User');
var Test = mongoose.model('Test');

module.exports = function(System) {
  var obj = {};

  obj.create = function(req, res) {
    User.find({_id: '54c6dc02904b06774e1aa0d1'}).exec(function(err, item) {
      console.log(arguments);
    });
    console.log('arguments');
    var t = new Test({name: 'Riten'});
    t.save(function(err) {
      console.log('done');
    });
    // console.log(t);

    // var user = new User({
    //   name: 'Riten',
    //   email: 'aaa@gmail.com',
    //   password: 'helloworld',
    //   username: 'ritenv'
    // });
    // user.provider = 'local';
    // user.roles = ['authenticated'];

    // console.log('Here');
    // user.save(function(err) {
    //   console.log('err');
    //   console.log(err);
    // });

    res({'status': 'User created'});
  };

  return obj;
};