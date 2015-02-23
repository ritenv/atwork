var mongoose = require('mongoose');
var Post = mongoose.model('Post');

module.exports = function(System) {
  var obj = {};
  var json = System.plugins.JSON;

  obj.create = function(req, res) {

    var post = new Post(req.body);
    post.creator = req.user._id;

    post.save(function(err) {
      if (err) {
        return json.unhappy(err, res);
      }
      return json.happy(post, res);
    });
  };
  
  obj.list = function(req, res) {
    //TODO: pagination
    Post.find({}, function(err, posts) {
      if (err) {
        json.unhappy(err, res);
      } else {
        json.happy({
          records: posts
        }, res);
      }
    });
  };

  obj.single = function(req, res) {
    Post.findOne({_id: req.param('postId')}).populate('creator').exec(function(err, post) {
      if (err) {
        return json.unhappy(err, res);
      } else if (post) {
        return json.happy({
          record: post
        }, res);
      } else {
        return json.unhappy({message: 'Post not found'}, res);
      }
    });
  };

  return obj;
};