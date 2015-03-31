'use strict';

/**
 * Module dependencies.
 */
var mongoose  = require('mongoose'),
    Schema    = mongoose.Schema,
    crypto    = require('crypto'),
          _   = require('lodash');

/**
 * Activity Schema
 */

var SettingsSchema = new Schema({
  name: String,
  value: String
});


mongoose.model('settings', SettingsSchema);
