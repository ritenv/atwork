
module.exports = function(System) {
  return {
    create: function(req, res) {
      res({'status': 'User created'});
    }
  };
};