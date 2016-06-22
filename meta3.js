var http = require('http');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');

iconv.skipDecodeWarning = true;

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

var input = fs.createReadStream(__dirname + '/nb.txt');
var writable = fs.createWriteStream(__dirname + '/nbStie.txt');
var wubinError = fs.createWriteStream(__dirname + '/nbError.txt');
readLines(input, func);


setInterval(function(){
	var len = container.length
	if(!len){
		return;
	}

	var link = container.pop();
	//var id = link.split('/')[2]
	geturl(link);
	console.log(link);
},10)

function writeErrorLine (data) {
	wubinError.write(data, 'utf8');
}

function writeLine (data) {
	writable.write(data, 'utf8');
}

var listA = ['index.html', 'index.htm', 'index.asp', 'index.php'];

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
		// if (link.startsWith('www.')) {
		// 	listA.foEach(function (item) {
		// 		container.push(link + '/' +item)
		// 	})
		// 	return;
		// }
		writeErrorLine(link);
		writeErrorLine('\n');
		});
	}
	catch(e){

	}
}

// function tryAgain(link, list) {
// 	list --;
// 	try{
// 	http.get('http://'+link+ listA[list], function (res) {
// 		var html = [];
// 		console.log(listA[list])
// 		res.on('data', function (data) {
// 			html.push(data);
// 		})
// 		res.on('end', function () {
// 			var isTry = list === 0 ? true : false;
// 			getcontent(Buffer.concat(html), link, isTry, false, list)
// 		})

// 		res.on('error', function (err) {
// 			//getcontent(html, link)
// 		})

// 	}).on('error', function(e) {

// 		//console.log("Got error: " + e.message);
// 		writeErrorLine(link);
// 		writeErrorLine('\n');
// 		});
// 	}
// 	catch(e){

// 	}
// }


// function try3wAgain(link, list) {
// 	list --;
// 	try{
// 	http.get('http://www'+link+ listA[list], function (res) {
// 		var html = [];
// 		console.log(listA[list])
// 		res.on('data', function (data) {
// 			html.push(data);
// 		})
// 		res.on('end', function () {
// 			var isTry = list === 0 ? true : false;
// 			getcontent(Buffer.concat(html), link, true, isTry, list)
// 		})

// 		res.on('error', function (err) {
// 			//getcontent(html, link)
// 		})

// 	}).on('error', function(e) {

// 		//console.log("Got error: " + e.message);
// 		writeErrorLine(link);
// 		writeErrorLine('\n');
// 		});
// 	}
// 	catch(e){

// 	}
// }

function getcontent (html, link) {
	list = list || 4;
	console.log('----------------------------')
	var len = container.length
	console.log(link)
	console.log('剩余站点' + len)
	if (html.indexOf('charset=gb2312') > 0){
		var _html=iconv.decode(html,'gb2312');
		console.log('gb2312')
	} else if (html.indexOf('charset=gbk') > 0 || html.indexOf('charset=GBK') > 0  ||  html.indexOf('charset="gbk"') > 0 ){
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
	console.log(description)
	// if (!isTry && !keywords && !description) {
	// 	return;
	// }
	if (!keywords && !description) {
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

