'use strict';

module.exports = {
  db: 'mongodb://ritenv:123.com@ds055680.mongolab.com:55680/atwork-dev',
  server: {
    host: 'localhost',
    port: process.env.PORT || 8111
  },
  secret: 'atworksecret'
};