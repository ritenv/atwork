/**
 * Load dependencies
 */
var Hapi = require('hapi');
var fs = require('fs');
var mongoose = require('mongoose');
var Config = require('./config/' + (process.env.NODE_ENV || 'development'));

/**
 * Path where modules are located
 */
var modulePath = __dirname + '/../modules';

/**
 * Create new server
 * @type {Object}
 */
var server = new Hapi.Server();

/**
 * Create config for ports
 */
server.connection({
  host: 'localhost',
  port: 8111
});

/**
 * Connect to the database
 * @return {Object} Returns the connection object
 */
var dbConnect = function() {
  var connection = mongoose.createConnection(Config.db);
  return connection;
};

/**
 * Load all files inside the models folder (mongoose models)
 * @param  {String} startingPath The starting path of the module
 * @return {Boolean}
 */
var loadDBModels = function(startingPath) {
  var modelsPath = startingPath + '/models';
  if (!fs.existsSync(modelsPath)) {
    return false;
  }
  var files = fs.readdirSync(modelsPath); //not allowing subfolders for now inside 'models' folder
  files.forEach(function(file) {
    require(modelsPath + '/' + file);
  });
  return true;
};

/**
 * Function to load all modules in the modules directory
 * @param  {Object}   System   The main system object
 * @param  {Function} callback The callback after loading all dependencies
 * @return {Void}
 */
var loadModules = function(System, callback) {
  fs.readdir(modulePath, function(err, list) {
    list.forEach(function(folder) {
      var folderPath = modulePath + '/' + folder;
      /**
       * Load needed db models
       */
      loadDBModels(folderPath);

      var moduleFile = folderPath + '/main.js';
      if (fs.existsSync(moduleFile)) {
        require(moduleFile)(System);
      }
    });
    callback();
  });
};

/**
 * Export the object
 * @type {Object}
 */
module.exports = {
  /**
   * Expose the server Object
   * @type {Object}
   */
  server: server,

  /**
   * Function to initialize the system and load all dependencies
   * @return {Void}
   */
  boot: function() {
    /**
     * Connect to database
     */
    dbConnect();

    /**
     * Finally, load dependencies and start the server
     */
    loadModules(this, function() {
      server.start();
    });
  },

  /**
   * Wrapping the server's route function 
   * @param  {Array} routes The array of routes
   * @return {Void}
   */
  route: function(routes) {
    server.route(routes);
  }

};