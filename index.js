var http = require('http');
var connect = require('./connect');
var app = connect();
require('./middle')(app);
require('./route')(app);
http.createServer(app).listen(8080);