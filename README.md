title: Why Express
desc: 2016-05-18 17:08:06
date: 2016-05-18 17:08:06
tags: express
---


[siyue_2]: ./middle.png "MDD"


<!-- ![][siyue_2] -->
当我们要用node搭建一个web应用的时候express往往是必不可少的， 那么express解决了什么问题，express是的工作原理是怎么样的，下面就进行阐述
<!-- more -->
- - - 

## 1. 源生node
下面一块代码就是源生node写的，运行之后访问'localhost:8080/list'就可以看到结果，诚然这样写代码是可执行可工作的，但是所有逻辑都耦合在一起，大量重复的代码，人们不希望看到这种情况。

	var http = require('http');
	var url = require('url');
	var querystring = require('querystring');
	var articles = {
	    "1":"第一篇文章详情",
	    "2":"第二篇文章详情",
	    "3":"第三篇文章详情"
	}
	http.createServer(function(req,res){
	  //所有的程序都要使用的代码
	  var urlObj = url.parse(req.url,true);
	  var pathname = urlObj.pathname;
	  var query = urlObj.query;

	  if(pathname == '/list'){
	      send('<ul><li><a href="/article?id=1">第一篇</a></li><li><a href="/article?id=2">第二篇</a></li><li><a href="/article?id=3">第三篇</a></li></ul>');
	  }else if(pathname == '/article'){
	      send(articles[query.id]);
	  }else{
	      res.end("404");
	  }
	    //公共的业务逻辑
	  function send(html){
	        res.writeHead(200,{'Content-Type':'text/html;charset=utf-8'});
	        res.end(html);
	  }
	}).listen(8080);

## 2. 中间件

中间件（Middleware） 是一个函数，它可以访问请求对象（request object (req)）, 响应对象（response object (res)）, 和 web 应用中处于请求-响应循环流程中的中间件，一般被命名为 next 的变量。
如果当前中间件没有终结请求-响应循环，则必须调用 next() 方法将控制权交给下一个中间件，否则请求就会挂起。
![][siyue_2]
结合图文我们可以这样理解，当请求到达中间件，中间件要对这个请求进行响应，响应过后使用next()方法久可以将请求传递给下一层中间件，两层之间没有逻辑耦合，这样符合我们开发的习惯，如：
a请求没有调用next()那么，该请求就会被挂起。
b请求调用了next()那么，请求将会被传递下去直到匹配到路由，请求就会被返回

## 3. middle实现
先把createServer中关于pathname和send拆分出来，使用app.use方法来进行中间件的注册，这两个中间件在request和response上添加了一些方法，方便后面的开发

	var url = require('url');
	module.exports = function(app){
		app.use(function(req, res, next){
			var urlObj = url.parse(req.url, true);
			var pathname = urlObj.pathname;
			var query = urlObj.query;
			req.pathname = pathname;
			req.query = query;
			next();
		});
		app.use(function(req, res, next){
			res.send = function(html){
					res.writeHead('200', {'Content-Type': 'text/html;charset=utf8;'});
					res.end(html);
			}
			next();
		});
	}

## 4. 路由的实现
之后处理路由，可以看到这里把路由也拆分出来，同样使用app.use的方法。那么下面就来说一下express是怎么封装use和调用use中传递的function

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

## 5. express的实现
express怎么实现use方法呢，先构造出一个app对象，这个对象有两个主要方法，一个use，一个handle。use方法就是用来注册中间件，每调用一次use方法就回把收到的参数存到一个数组即stack里面。 每当server收到一个请求，就会调用app方法，进而执行handle方法，当执行stack中存储的function时，如果function中调用了next()方法，那么请求就回被传递到下一个function，直到匹配到路由返回请求结果，如果不调用next()这个请求就会被一直挂起

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

这时的入口文件被改成了这样

	var http = require('http');
	var connect = require('./connect');
	var app = connect();
	require('./middle')(app);
	require('./route')(app);
	http.createServer(app).listen(8080);

git仓库地址：https://github.com/chobit000/easyExpress
