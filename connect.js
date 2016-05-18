var proto = {};
var url = require('url');
function createServer(){
	function app(req, res){
		app.handle(req, res);
	}
	Object.assign(app, proto);
	app.stack = [];
	return app;
}
proto.use = function(route, fn){
	if(!fn){
		fn = route;
		route = '/';
	}
	this.stack.push({route : route, fn : fn});
}
proto.handle = function(req, res){
	var index = 0;
	var stack = this.stack;
	var urlObj = url.parse(req.url, true);
	var pathname = urlObj.pathname;
	function next(){
		var obj = stack[index++];
		if(pathname.startsWith (obj.route)){
			obj.fn(req, res, next);
		}
		else{
			next();
		}	
	}
	next();
}
module.exports = createServer;