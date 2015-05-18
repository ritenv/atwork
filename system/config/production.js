'use strict';

module.exports = {
  REQUESTS_DELAY: 0,
  REQUESTS_DELAY_SYSTEM: 0,
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
  },
  aws: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
};