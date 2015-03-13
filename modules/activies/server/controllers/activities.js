var mongoose = require('mongoose');
var Activity = mongoose.model('Activity');

module.exports = function(System) {
  var obj = {};
  var json = System.plugins.JSON;
  var event = System.plugins.event;
  
  event.on('like', function(post) {
    console.log(post.content, 'has been liked');
  });

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
    Activity.find(criteria, null, {sort: {created: -1}}).populate('creator').populate('post').exec(function(err, posts) {
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