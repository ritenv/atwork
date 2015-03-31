module.exports = function(System) {
  var sck = System.webSocket;
  var plugin = {
    /**
     * The helper register method
     * @return {Void}
     */
    register: function () {
      return {
        send: function(socketId, data) {
          sck.to(socketId).emit('notification', data);
        },
        sendByEmail: function(user, data) {
          var mailOptions = {
            from: data.actor.name + ' via AtWork <'+ System.settings.email +'>', // sender address
            to: 'ritensv@gmail.com', //user.email, // list of receivers
            subject: 'Notification', // Subject line
            // text: 'There has been a new activity.', // plaintext body
            html: data.html
          };
          System.mailer.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Message sent: ' + info.response);
            }
          });
        },
      };
    }
  };

  /**
   * Attributes to identify the plugin
   * @type {Object}
   */
  plugin.register.attributes = {
    name: 'Notifications Helper',
    key: 'notifications',
    version: '1.0.0'
  };
  return plugin;
};