var Hapi = require('hapi');

var server = new Hapi.Server();

server.connection({
  host: 'localhost',
	port: 8111
});

server.route({
  method: 'GET',
	path: '/hello',
	handler: function(req, res) {
		res('Hello world');
	}
});

server.start();