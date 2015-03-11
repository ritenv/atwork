/**
 * Load dependencies
 */
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var fs = require('fs');
var mongoose = require('mongoose');
var Config = require('./config/' + (process.env.NODE_ENV || 'development'));
var bodyParser = require('body-parser');
var multer = require('multer'); 
var morgan = require('morgan');

io.on('connection', function(socket){
  console.log('a user connected');
});

/**
 * Middleware
 */
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use(multer({ dest: './public/uploads/'})); // for parsing multipart/form-data
app.use(morgan("dev"));
app.use(function(req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type, Authorization');
    next();
});
var options = {
  dotfiles: 'ignore',
  etag: false,
  // extensions: ['htm', 'html'],
  index: false,
  maxAge: '1d',
  redirect: false,
  setHeaders: function (res, path, stat) {
    res.set('x-timestamp', Date.now())
  }
};
app.use(express.static('public', options));
app.use('/system', express.static('system/public', options));
app.use('/system/public/views', express.static('system/public/views', options));

/**
 * Path where modules are located
 */
var modulePath = __dirname + '/../modules';
var moduleURL = 'modules';

/**
 * Create new server
 * @return {Void}
 */
function startServer() {
  app.use(function(req, res) {
    res.redirect('/index.html');
  });
  var server = http.listen(Config.server.port, function() {
    var host = server.address().address
    var port = server.address().port

    console.log('AtWork running at http://%s:%s', host, port);
  });
}

/**
 * Load built-in system routes
 * @param  {Object} System The system object
 * @return {Void}
 */
function systemRoutes(System) {
  var routes = require('./routes/search')(System);
  routes.forEach(function(route) {
    var moduleRouter = express.Router();
    if (!route.authorized) {
      moduleRouter[route.method](route.path, route.handler);
    } else {
      moduleRouter[route.method](route.path, System.auth.ensureAuthorized, route.handler);
    }
    app.use('/', moduleRouter);
  });
}

/**
 * Connect to the database
 * @return {Object} Returns the connection object
 */
var dbConnect = function() {
  var db = mongoose.connect(Config.db);
  return db;
};

/**
 * Connect to the database
 * @return {Object} Returns the connection object
 */
var loadPlugins = function(startingPath, System) {
  var helpersPath = startingPath + '/helpers';
  if (!fs.existsSync(helpersPath)) {
    return false;
  }
  var files = fs.readdirSync(helpersPath); //not allowing subfolders for now inside 'helpers' folder
  files.forEach(function(file) {
    
    var plugin = require(helpersPath + '/' + file)(System);
    System.plugins[plugin.register.attributes.key] = plugin.register();
    console.log('Loaded plugin: ' + file);
  });

  /**
   * Expose the auth plugin
   */
  System.auth = System.plugins.auth;

  return true;
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
    console.log('Loaded model: ' + file);
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
  var list = fs.readdirSync(modulePath);

  list.forEach(function(folder) {
    var serverPath = modulePath + '/' + folder + '/server';
    var publicPath = moduleURL + '/' + folder;
    
    /**
     * Expose public paths
     */
    app.use('/' + publicPath, express.static(publicPath + '/public', options));

    /**
     * Load needed db models
     */
    loadDBModels(serverPath);

    var moduleFile = serverPath + '/main.js';
    if (fs.existsSync(moduleFile)) {
      require(moduleFile)(System);
    }
  });
  callback();
};

/**
 * Export the object
 * @type {Object}
 */
module.exports = {

  /**
   * Dynamically loaded plugins are accessible under plugins
   * @type {Object}
   */
  plugins: {},

  /**
   * Function to initialize the system and load all dependencies
   * @return {Void}
   */
  boot: function() {
    /**
     * Reference self
     * @type {Object}
     */
    var $this = this;

    /**
     * Pass the config object as is for now (TODO: reduce sensitive data)
     * @type {[type]}
     */
    this.config = Config;

    /**
     * Connect to database
     */
    dbConnect();

    /**
     * Load the helpers
     */
    loadPlugins(__dirname, this);
    
    /**
     * Finally, load dependencies and start the server
     */
    loadModules(this, function() {
      systemRoutes($this);
      startServer();
    });
  },

  /**
   * Reduced config object
   * @type {Object}
   */
  config: {},

  /**
   * Wrapping the server's route function 
   * @param  {Array} routes The array of routes
   * @return {Void}
   */
  route: function(routes, moduleName) {
    var $this = this;

    /**
     * Module name is mandatory
     * @type {String}
     */
    moduleName = moduleName || 'unidentified';

    /**
     * Prefix each route to its module's path
     */
    routes.forEach(function(route) {
      var moduleRouter = express.Router();
      if (!route.authorized) {
        moduleRouter[route.method](route.path, route.handler);
      } else {
        moduleRouter[route.method](route.path, $this.auth.ensureAuthorized, route.handler);
      }
      app.use('/' + moduleName, moduleRouter);
    });
  }

};