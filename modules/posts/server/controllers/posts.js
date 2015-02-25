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
  
  /**
   * Get posts written by the current user
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.timeline = function(req, res) {
    var userId = req.param('userId') || req.user._id;
    //TODO: pagination
    Post.find({ creator: userId }, null, {sort: {created: -1}}).populate('creator').exec(function(err, posts) {
      if (err) {
        json.unhappy(err, res);
      } else {
        json.happy({
          records: posts
        }, res);
      }
    });
  };

  /**
   * Get posts from users being followed
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.feed = function(req, res) {
    //TODO: pagination
    var user = req.user;
    Post.find({ creator: { $in: user.following.concat(user._id) } }, null, {sort: {created: -1}}).populate('creator').exec(function(err, posts) {
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