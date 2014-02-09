
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');


var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

server.listen(3000);

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(require('stylus').middleware(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);

var cheerio = require('cheerio');
var request = require('request');
var url = "http://www.rarejob.com/reservation/";
var async = require('async');

io.sockets.on('connection', function (socket) {
	socket.on('use_loop',function(){
		console.log('Starting to scrape data using loop');
		use_loop(socket);
	})	
	socket.on('use_whilst',function(){
		console.log('Starting to scrape data using whilst');
		use_whilst(socket);
	})
});


function use_loop(socket){
	options = {
		url: getRareJobUrl(),
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		}	
	}
	var reservations = 0;

	request(options, function(err, ajax_res, body){
		if(!err && ajax_res.statusCode == 200){
			for(var i = 0; i < getMaxPage(body); i ++){
				(function(index){
					request({url: getRareJobUrl(index + 1), headers: {'X-Requested-With': 'XMLHttpRequest'} }, function(err, response, body){
						if(!err && response.statusCode == 200){
							$ = cheerio.load(body);
							reservations += $(".reserveBtn").length;
							socket.emit('loop',{ reservations: reservations });
						}else{
							console.log(err);
							index --;
						}
					});		
				})(i);
			}
		}else{ console.log(err); }
	});
}

function use_whilst(socket){
	options = {
		url: getRareJobUrl(),
		headers: {
			'X-Requested-With': 'XMLHttpRequest'
		}	
	}
	var reservations = 0;
	var count = 0;

	request(options, function(err, ajax_res, body){
		if(!err && ajax_res.statusCode == 200){
			async.whilst(
				function () {return count < getMaxPage(body)},
				function (callback) {
					request({url: getRareJobUrl(count + 1), headers: {'X-Requested-With': 'XMLHttpRequest'} }, function(err, response, body){
						if(!err && response.statusCode == 200){
							$ = cheerio.load(body);
							reservations += $(".reserveBtn").length;
							socket.emit('whilst',{ reservations: reservations });
						}else{ console.log(err); }
						count++;
						callback();
					});		
				},
				function () {}
			);
		}else{console.log(err);}
	});
}

function getMaxPage(body){
	$ = cheerio.load(body);
	ajax_link = $('ul.pager > li:last-child a').attr('href');
	last_page = ajax_link.split('/')[ajax_link.split('/').indexOf('page') + 1];
	return last_page;
}

function getRareJobUrl(page){
	var date = new Date(),
		year = date.getFullYear(),
		month = (date.getMonth() + 1),
		day = date.getDate();
	page = page || 1;
	url = 'http://www.rarejob.com/ajax/reservationSearch/?year='+year+'&month='+month+'&day='+day+'&time1=0&time2=0&jpLevel=0&gender=0&majors=&page='+page+'&characters=';
	return url
}

