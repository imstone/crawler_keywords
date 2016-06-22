var http = require('http');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var url = 'http://www.zhihu.com/topic/19550901/questions?page=';
iconv.skipDecodeWarning = true;
var n =10;


var fs=require("fs");
var container = [];

function readLines(input, func) {
  var remaining = '';
  input.on('data', function(data) {
    remaining += data;
    var index = remaining.indexOf('\n');
    while (index > -1) {
      var line = remaining.substring(0, index);
      remaining = remaining.substring(index + 1);
      func(line);
      index = remaining.indexOf('\n');
    }

  });

  input.on('end', function() {
    if (remaining.length > 0) {
      func(remaining);
      console.log(container)
    }
  });
}

function func(data) {


  container.push(data);
}

var input = fs.createReadStream(__dirname + '/valued_subdomain.txt');
var writable = fs.createWriteStream(__dirname + '/wubin.txt');
var wubinError = fs.createWriteStream(__dirname + '/wubinError1.txt');
readLines(input, func);


setInterval(function(){
	var len = container.length
	if(!len){
		return;
	}
	console.log('----------------------------')
	console.log('剩余站点' + len)
	var link = container.pop();
	//var id = link.split('/')[2]
	geturl(link);
	console.log(link);
},10)

function writeErrorLine (data) {
	wubinError.write(data, 'utf8');
}

function writeLine (data) {


	//writable.on('finish', function(){
	//  console.log('write finished');
	  //process.exit(0);
	//});

	//writable.on('error', function(err){
	//  console.log('write error - %s', err.message);
	//});

	writable.write(data, 'utf8');
}



function geturl(link) {
	try{
	http.get('http://'+link, function (res) {
		var html = [];
		res.on('data', function (data) {
			html.push(data);
		})
		res.on('end', function () {
			getcontent(Buffer.concat(html), link)
		})

		res.on('error', function (err) {
			//getcontent(html, link)
		})

	}).on('error', function(e) {

		//console.log("Got error: " + e.message);
		writeErrorLine(link);
		writeErrorLine('\n');
		});
	}
	catch(e){

	}
}

function tryAgain(link) {
	var list = ['index.html', 'index.htm', 'index.asp', 'index.php'];
	try{
	http.get('http://'+link+ list.pop(), function (res) {
		var html = [];
		res.on('data', function (data) {
			html.push(data);
		})
		res.on('end', function () {
			getcontent(Buffer.concat(html), link, !list.length)
		})

		res.on('error', function (err) {
			//getcontent(html, link)
		})

	}).on('error', function(e) {

		//console.log("Got error: " + e.message);
		writeErrorLine(link);
		writeErrorLine('\n');
		});
	}
	catch(e){

	}
}


function getcontent (html, link, isTry ) {


	if (html.indexOf('charset=gb2312') > 0){
		var _html=iconv.decode(html,'gb2312');
		console.log('gb2312')
	} else if (html.indexOf('charset=gbk') > 0 || html.indexOf('charset=GBK') > 0){
		var _html=iconv.decode(html,'gbk');
		console.log('gbk')
	}else {
		var _html=html;
		console.log('utf-8')
	}
	var $ = cheerio.load(_html);

	var keywords = $('[name="keywords"]').attr('content');
	var description = $('[name="description"]').attr('content');
	console.log(keywords)
	if (!isTry && !keywords && !description) {
		return;
	}
	if (!keywords && !description) {
		if (!isTry) {
			tryAgain(link);
			return;
		}
		writeLine(link)
		writeLine('\n')
		writeLine('-1')
		writeLine('\n')
	}
	if(keywords) {
		writeLine(link)
		writeLine('\n')
		writeLine(keywords.trim())
		writeLine('\n')

	}
	if(description) {
		writeLine(description.trim())
		writeLine('\n')
	}
	// writeLine(meta)
	// writeLine('\n')
	console.log('----------------------------')
}

