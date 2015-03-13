var mongoose = require('mongoose');
var Post = mongoose.model('Post');

module.exports = function(System) {
  var obj = {};
  var json = System.plugins.JSON;
  var sck = System.webSocket;

  /**
   * Get activities for a user
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.feed = function(req, res) {
    //TODO: pagination
    var userId = req.params.userId;
    var criteria = { creator: userId };
    Post.find(criteria, null, {sort: {created: -1}}).populate('creator').populate('post').exec(function(err, posts) {
      if (err) {
        json.unhappy(err, res);
      } else {
        json.happy({
          records: posts
        }, res);
      }
    });
  };

  return obj;
};