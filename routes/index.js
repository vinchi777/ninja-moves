
/*
 * GET home page.
 */

var cheerio = require('cheerio');
var request = require('request');
var url = "http://www.rarejob.com/reservation/";

exports.index = function(req, res){
  options = {
    url: 'http://www.rarejob.com/ajax/reservationSearch/?year=2014&month=2&day=7&time1=0&time2=0&jpLevel=0&gender=0&majors=&page=25&characters=',
    headers: {
      'X-Requested-With': 'XMLHttpRequest'
    }
  }

  request(options, function(err, res, body){
    if(!err && res.statusCode == 200){
      console.log(body);
    }else{
      console.log(err);
    }

  });

  res.render('index', { title: "Ninja Moves" });
};
