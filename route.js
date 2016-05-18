var API = require('./data');
var fs = require('fs');
var ejs = require('ejs');
module.exports = function(app){
	app.use('/list', function(req, res, next){
		API.getList(function(re){
			fs.readFile('./index.ejs', 'utf8', function(err, data){		
				res.send(ejs.render(data, re));
			})
		});	
	});
	app.use('/article',function(req, res, next){		
		API.getArticle(function(re){
			res.send(re);
		},req.query.id)
	});
	app.use(function(req, res, next){
		res.end("404");
	});
}