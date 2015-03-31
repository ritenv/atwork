'use strict';

module.exports = {
  baseURL: 'http://localhost:8111',
  db: 'mongodb://ritenv:123.com@ds055680.mongolab.com:55680/atwork-dev',
  server: {
    host: 'localhost',
    port: process.env.PORT || 8111
  },
  secret: 'atworksecret',
  settings: {
  	perPage: 10,
  	email: {
  		service: 'Gmail'
  	}
  }
};