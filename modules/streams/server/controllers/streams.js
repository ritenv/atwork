var mongoose = require('mongoose');
var Stream = mongoose.model('Stream');

module.exports = function(System) {
  var obj = {};
  var json = System.plugins.JSON;
  var event = System.plugins.event;
  var sck = System.webSocket;

  /**
   * Stream related sockets
   */
  sck.on('connection', function(socket){
    socket.on('stream', function(streamId) {
      socket.broadcast.emit('stream', streamId);
    });
  });

  /**
   * Create a stream
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.create = function (req, res) {
    var stream = new Stream(req.body);
    stream.creator = req.user._id;
    stream.subscribers.push(req.user._id);

    stream.save(function(err) {
      if (err) {
        return json.unhappy(err, res);
      }
      return json.happy(stream, res);
    });
  };

  /**
   * Modify a stream
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.modify = function (req, res) {
    Stream.findOne({
      _id: req.params.streamId
    })
    .populate('creator')
    .exec(function(err, stream) {
      if (err) {
        return json.unhappy(err, res);
      }
      stream.purpose = req.body.purpose;
      stream.title = req.body.title || stream.title;
      stream.save(function(err) {
        if (err) {
          return json.unhappy(err, res);
        }
        return json.happy(stream, res);
      });
    });
  };

  /**
   * List all streams
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.list = function (req, res) {
    var user = req.user;

    var criteria = {};

    /**
     * Do we want only subscribed streams?
     */
    if (req.query.subscribed) {
      criteria.subscribers = req.user._id;
    }

    /**
     * Do we want only unsubscribed streams?
     */
    if (req.query.unsubscribed) {
      criteria.subscribers = {$ne: req.user._id};
    }

    Stream.find(criteria, null, {sort: {title: 1}})
    .populate('creator')
    .skip(parseInt(req.query.page) * System.config.settings.perPage)
    .limit(System.config.settings.perPage+1)
    .exec(function(err, streams) {
      if (err) {
        json.unhappy(err, res);
      } else {
        var morePages = System.config.settings.perPage < streams.length;
        if (morePages) {
          streams.pop();
        }
        json.happy({
          records: streams,
          morePages: morePages
        }, res);
      }
    });
  };

  /**
   * Return info about single stream
   * @param  {Object} req The req object
   * @param  {Object} res The res object
   * @return {Void}
   */
  obj.single = function(req, res) {
    Stream.findOne({
      _id: req.params.streamId
    })
    .populate('creator')
    .exec(function(err, stream) {
      if (err) {
        return json.unhappy(err, res);
      } else if (stream) {

        return json.happy({
          record: stream
        }, res);
      } else {
        return json.unhappy({message: 'Stream not found'}, res);
      }
    });
  };

  /**
   * Subscribe to a stream
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.subscribe = function (req, res) {
    Stream.findOne({_id: req.params.streamId})
    .populate('creator')
    .exec(function(err, stream) {
      if (err) {
        return json.unhappy(err, res);
      } else if (stream) {
        if (stream.subscribers.indexOf(req.user._id) !== -1) {
          return json.unhappy('You have already subscribers to the group', res);
        }
        stream.subscribe(req.user._id);
        stream.save(function(err, item) {
          if (err) {
            return json.unhappy(err, res);
          }
          json.happy({
            record: item
          }, res);
        });
        
      } else {
        return json.unhappy({message: 'Stream not found'}, res);
      }
    });
  };

  /**
   * Unsubscribe to a stream
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.unsubscribe = function (req, res) {
    Stream.findOne({_id: req.params.streamId})
    .populate('creator')
    .exec(function(err, stream) {
      if (err) {
        return json.unhappy(err, res);
      } else if (stream) {
        if (stream.subscribers.indexOf(req.user._id) !== -1) {
          stream.subscribers.splice(stream.subscribers.indexOf(req.user._id), 1);
        } else {
          return json.unhappy('You have ubsubscribed', res);
        }
        
        stream.save(function(err, item) {
          if (err) {
            return json.unhappy(err, res);
          }
          json.happy({
            record: item
          }, res);
        });
        
      } else {
        return json.unhappy({message: 'Stream not found'}, res);
      }
    });
  };

  /**
   * Remove the stream
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.remove = function (req, res) {

  };

  return obj;
};