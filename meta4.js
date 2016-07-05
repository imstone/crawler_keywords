var http = require('http');
var cheerio = require('cheerio');
var iconv = require('iconv-lite');
var nnn = 0;
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
      // console.log(container)
    }
  });
}

function func(data) {
  container.push(data);
}

var input = fs.createReadStream(__dirname + '/hulianwang.txt');
var writable = fs.createWriteStream(__dirname + '/hulianwangStie5.txt');
var wubinError = fs.createWriteStream(__dirname + '/hulianwangError5.txt');
readLines(input, func);


setInterval(function(){
	var len = container.length
	if(!len){
		return;
	}

	var link = container.pop();
	//var id = link.split('/')[2]
	geturl(link);

	//console.log(link);
},20)

function writeErrorLine (data) {
		wubinError.write(data, 'utf8');

}

function writeLine (data) {

		console.log('##########################')
		var lls = writable.write(data, 'utf8');
		writable.on('error', function(err){
			console.log(err)
		})
		console.log(nnn++)
		console.log(lls)
	
}

var listA = ['index.html', 'index.htm', 'index.asp', 'index.php'];

function geturl(link, isHttp) {
	//console.log(link)
	try{
	http.get(isHttp ?link: 'http://'+link, function (res) {
		if (res.statusCode === 200){			
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
		} else if(res.statusCode === 301 || res.statusCode === 302){
				geturl(res.headers.location, true)
			}

	}).on('error', function(e) {

		//console.log("Got error: " + e.message);
		// if (link.startsWith('www.')) {
		// 	listA.foEach(function (item) {
		// 		container.push(link + '/' +item)
		// 	})
		// 	return;
		// }
		//writeErrorLine(link);
		//writeErrorLine('\n');
		});
	}
	catch(e){

	}
}


var nbhtml =''
function getcontent (html, link) {
	// list = list || 4;
	//console.log('----------------------------')
	var len = container.length
	//console.log(link)
	//console.log('剩余站点' + len)
	if (html.indexOf('charset=gb2312') > 0){
		var _html=iconv.decode(html,'gb2312');
		//console.log('gb2312')
	} else if (html.indexOf('charset=gbk') > 0 || html.indexOf('charset=GBK') > 0  ||  html.indexOf('charset="gbk"') > 0 ){
		var _html=iconv.decode(html,'gbk');
		//console.log('gbk')
	}else {
		var _html=html;
		//console.log('utf-8')
	}
	var $ = cheerio.load(_html);

	var keywords = $('[name="keywords"]').attr('content');
	if (!keywords){
	    keywords = $('[name="Keywords"]').attr('content');
	}
	var description = $('[name="description"]').attr('content');
	console.log(keywords)
	console.log(description)
	// if (!isTry && !keywords && !description) {
	// 	return;
	// }
	
	if (!keywords && !description) {
		line = link + '\n -1 \n'
		// writeLine(line)


	}else{
		var line = '';	
		keywords = keywords ? keywords.replace('\n','')	: '';
		description = description? description.replace('\n',''):''
		line = link + '\n '+ (keywords? keywords.trim() :'无') + '\n' + (description? description.trim() :'无')+ '\n'
		$.pipe(writable)
		// writeLine(line)

		

	}

	// writeLine(meta)
	// writeLine('\n')
	console.log('----------------------------')
}

