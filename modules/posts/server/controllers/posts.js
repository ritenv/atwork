var mongoose = require('mongoose');
var Post = mongoose.model('Post');

module.exports = function(System) {
  var obj = {};
  var json = System.plugins.JSON;

  /**
   * Create a new post
   * @param  {Object} req Request
   * @param  {Object} res Response
   * @return {Void}
   */
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
   * Create a new comment
   * @param  {Object} req Request
   * @param  {Object} res Response
   * @return {Void}
   */
  obj.comment = function(req, res) {
    var postId = req.params.postId;
    Post.findOne({ _id: postId }).exec(function(err, post) {
      post.replies.push({
        creator: req.user._id,
        content: req.body.comment
      });
      post.save(function(err) {
        if (err) {
          return json.unhappy(err, res);
        }
        return json.happy(post, res);
      });
    });
  };

  /**
   * Get posts written by the current user
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.timeline = function(req, res) {
    var userId = req.params.userId || req.user._id;
    //TODO: pagination
    Post.find({ creator: userId }, null, {sort: {created: -1}}).populate('creator').exec(function(err, posts) {
      if (err) {
        json.unhappy(err, res);
      } else {
        posts.map(function(e) {
          e.liked = e.likes.indexOf(req.user._id) != -1;
        });
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

        posts.map(function(e) {
          e.liked = e.likes.indexOf(req.user._id) != -1;
        });

        json.happy({
          records: posts
        }, res);
      }
    });
  };

  /**
   * Get a single post
   * @param  {Object} req Request
   * @param  {Object} res Response
   * @return {Void}
   */
  obj.single = function(req, res) {
    Post.findOne({_id: req.params.postId}).populate('creator').exec(function(err, post) {
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

  /**
   * Like a post
   * @param  {Object} req Request
   * @param  {Object} res Response
   * @return {Void}
   */
  obj.like = function(req, res) {
    Post.findOne({_id: req.params.postId}).exec(function(err, post) {
      if (err) {
        return json.unhappy(err, res);
      } else if (post) {
        if (post.likes.indexOf(req.user._id) !== -1) {
          return json.unhappy('You have already liked the post', res);
        }
        post.likes.push(req.user._id);
        post.save(function(err, item) {
          if (err) {
            return json.unhappy(err, res);
          }
          json.happy({
            record: item
          }, res);
        });
        
      } else {
        return json.unhappy({message: 'Post not found'}, res);
      }
    });
  };

  /**
   * unLike a post
   * @param  {Object} req Request
   * @param  {Object} res Response
   * @return {Void}
   */
  obj.unlike = function(req, res) {
    Post.findOne({_id: req.params.postId}).exec(function(err, post) {
      if (err) {
        return json.unhappy(err, res);
      } else if (post) {
        if (post.likes.indexOf(req.user._id) !== -1) {
          post.likes.splice(post.likes.indexOf(req.user._id), 1);
          post.save(function(err, item) {
            if (err) {
              return json.unhappy(err, res);
            }
            return json.happy({
              record: item
            }, res);
          });
        } else {
          return json.unhappy('You have not yet liked the post', res);
        }
        
      } else {
        return json.unhappy({message: 'Post not found'}, res);
      }
    });
  };



  return obj;
};