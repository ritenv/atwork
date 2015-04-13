var mongoose = require('mongoose');
var Activity = mongoose.model('Activity');

module.exports = function(System) {
  var User = mongoose.model('User');
  var obj = {};
  var json = System.plugins.JSON;
  var event = System.plugins.event;
  
  /**
   * Event listeners for post activities
   */
  ['like', 'unlike', 'comment', 'newpost'].map(function(action) {
    event.on(action, function(data) {
      var post = data.post;
      var actor = data.actor;
      console.log(post.content, 'has been', action, 'by', actor.name);
      obj.create(action, actor, post);
    });
  });
  
  /**
   * Create a new activity
   * @param  {Object} req Request
   * @param  {Object} res Response
   * @return {Void}
   */
  obj.create = function(action, actor, post) {
    var activity = new Activity({
      actor: actor,
      post: post,
      action: action
    });
    activity.save(function(err) {
      if (err) {
        return err;
      }
      return activity;
    });
  };

  /**
   * Get activities for a user
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.feed = function(req, res) {

    /**
     * The search criteria
     * @type {Object}
     */
    var criteria = {};

    /**
     * Can accept user's _id or username
     */
    if (mongoose.Types.ObjectId.isValid(req.params.userId)) {
      criteria._id = req.params.userId;
    } else {
      criteria.username = req.params.userId;
    }

    User
    .findOne(criteria)
    .lean()
    .exec(function(err, user) {
      if (err) {
        return json.unhappy(err, res);
      }
      var activityCriteria = { actor: user._id };
      Activity.find(activityCriteria, null, {sort: {created: -1}}).populate('actor').populate('post').exec(function(err, posts) {
        if (err) {
          return json.unhappy(err, res);
        } else {
          return json.happy({
            records: posts
          }, res);
        }
      });
    });
  };

  return obj;
};