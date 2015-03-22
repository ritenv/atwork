'use strict';
console.log('Config in development');
module.exports = {
  db: process.env.MONGOHQ_URL || 'mongodb://' + (process.env.DB_PORT_27017_TCP_ADDR || 'localhost') + '/atwork-dev',
  server: {
    host: 'localhost',
    port: 8111
  },
  secret: 'atworksecret',
  settings: {
  	perPage: 3
  }
};