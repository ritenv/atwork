'use strict';

process.env.NODE_ENV = 'development';
var appRoot = __dirname + '/../../';
global.System = require(appRoot + 'index');

/**
 * Mock event plugin
 * @type {Object}
 */
global.System.plugins.event = {
  on: function() {
    return true;
  },
  trigger: function() {
    return true;
  }
};