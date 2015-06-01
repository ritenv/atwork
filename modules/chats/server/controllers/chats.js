var mongoose = require('mongoose');
var Chat = mongoose.model('Chat');

module.exports = function(System) {
  var obj = {};
  var json = System.plugins.JSON;
  var event = System.plugins.event;
  var sck = System.webSocket;

  /**
   * Chat related sockets
   */
  sck.on('connection', function(socket){
    socket.on('markAccessed', function(data) {
      Chat
      .findOne({_id: data.chatId})
      .exec(function(err, chat) {
        chat.doAccess({_id: data.userId});
        chat.calculateUnread();
        chat.save();
      });
    });
  });


  /**
   * Event based notifications
   */
  ['chatMessage'].map(function(action) {
    event.on(action, function(data) {
      var chat = data.chat;
      var actor = data.actor;
      var chatMessage = data.message;
      chat.notifyUsers({
        chatId: chat._id,
        actorId: actor._id,
        type: action,
        chatMessage: chatMessage,
        config: {
          systemLevel: true
        }
      }, System);
    });
  });

  /**
   * Create a stream
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.create = function (req, res) {

    /**
     * Always sort, so whoever creates, it has participants in the same order
     */
    if (req.body.participants) {
      req.body.participants.sort(function(a, b) {
        return a < b;
      });
    }

    var criteria = {};
    if (req.body.chatId) {
      criteria = {
        _id: req.body.chatId
      };
    } else {
      criteria = {
        participants: req.body.participants
      };
    }
    Chat.findOne(criteria)
    .populate('creator')
    .populate('participants')
    .populate('messages')
    .populate('messages.creator')
    .exec(function(err, chat) {
      if (err) {
        return json.unhappy(err, res);
      } else if (chat) {
        chat.doAccess(req.user);
        chat.calculateUnread();
        chat.save(function(err, chat) {
          return json.happy({
            record: chat
          }, res);
        });
      } else {
        var chat = new Chat(req.body);
        chat.creator = req.user._id;
        
        /**
         * Mark as first accessed for each participant
         */
        req.body.participants.map(function(userId) {
          chat.doAccess({_id: userId});
        });
        chat.save(function(err) {
          if (err) {
            return json.unhappy(err, res);
          }
          return json.happy({
            record: chat
          }, res);
        });
      }
    });
  };

  /**
   * Create a stream
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.message = function (req, res) {
    Chat.findOne({
      _id: req.params.chatId
    })
    .populate('creator')
    .populate('participants')
    .populate('messages')
    .populate('messages.creator')
    .exec(function(err, chat) {
      if (err) {
        return json.unhappy(err, res);
      } else if (chat) {
        chat.messages.unshift({
          message: req.body.message,
          creator: req.user._id
        });
        chat.doAccess(req.user);
        chat.calculateUnread();
        chat.save(function(err, chat) {
          chat
          .populate('messages messages.creator', function(err, chat) {
            event.trigger('chatMessage', {chat: chat, message: chat.messages[0], actor: req.user});
            return json.happy({
              record: chat
            }, res);
          })
        })
      } else {
        return json.unhappy({message: 'Chat not found'}, res);
      }
    });
  };

  /**
   * Modify a stream
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.addParticipant = function (req, res) {
    Chat.findOne({
      _id: req.params.chatId
    })
    .populate('creator')
    .exec(function(err, chat) {
      if (err) {
        return json.unhappy(err, res);
      }
      chat.participants.push = req.body.userId;
      chat.save(function(err) {
        if (err) {
          return json.unhappy(err, res);
        }
        return json.happy(chat, res);
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

    var criteria = {
      participants: req.user
    };

    Chat.find(criteria, null, {sort: {modified: 1}})
    .populate('creator')
    .populate('participants')
    .skip(parseInt(req.query.page) * System.config.settings.perPage)
    .limit(System.config.settings.perPage+1)
    .exec(function(err, chats) {
      chats.map(function(chat) {
        chat.calculateUnreadFor(req.user);
      });
      if (err) {
        json.unhappy(err, res);
      } else {
        var morePages = System.config.settings.perPage < chats.length;
        if (morePages) {
          chats.pop();
        }
        json.happy({
          records: chats,
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
    Chat.findOne({
      _id: req.params.chatId
    })
    .populate('creator')
    .populate('participants')
    .populate('messages')
    .populate('messages.creator')
    .exec(function(err, chat) {
      if (err) {
        return json.unhappy(err, res);
      } else if (chat) {

        return json.happy({
          record: chat
        }, res);
      } else {
        return json.unhappy({message: 'Chat not found'}, res);
      }
    });
  };

  return obj;
};