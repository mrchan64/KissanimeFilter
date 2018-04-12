var http = require('http'),
    zlib = require('zlib'),
    querystring = require('querystring'),
    stream = require('stream'),
    DPS = require('./dataprocess');

const THIS_DOM = process.env.PORT ? "animefilter.herokuapp.com" : "localhost:3000";
DPS.THIS_DOM = THIS_DOM;

var req_num = 0;

exports.getProxy = function(req, newres){
  //var path = req.url.substring(6);
  var path = addqueries(req);
  var num = req_num++;
  console.log(' [' + num + '] Processing GET request to kissanime.ru with path "'+path+'"');
  var newHeaders = req.headers;
  newHeaders.path = path;
  newHeaders.host = 'kissanime.ru';
  if(newHeaders.referer)newHeaders.referer = newHeaders.referer.replace(THIS_DOM, "kissanime.ru");
  var cookie = "";
  Object.keys(req.cookies).forEach((key)=>{
    cookie+=key+"="+req.cookies[key]+"; "
  });
  newHeaders.cookie = cookie;

  //temp
  //newHeaders.cookie = newHeaders.cookies+"cf_clearance=3e093569fc67cb62af79bf95c0583c2517408526-1522204302-28800"

  var interm = new stream.PassThrough();
  var options = {
    'hostname': newHeaders.host,
    'path': path,
    'headers': newHeaders
  }
  var newreq = http.get(options, (res)=>{
    var total = new Buffer(0);
    res.on('data', (chunk)=>{
      total = Buffer.concat([total, chunk]);
    });
    res.on('end', ()=>{
      //console.log(' [' + num + '] -> Finished retrieving request.')
      total = modifycfclear(total, res);
      copyresheader(res, newres);
      modifygetzipped(total, res, options, (dezipped)=>{
        interm.write(dezipped);
        interm.end();
      });
    });
  });
  newreq.end();
  interm.pipe(newres);
}

exports.postProxy = function(req, newres){
  //var path = req.url.substring(6);
  var path = addqueries(req);
  var num = req_num++;
  console.log(' [' + num + '] Processing POST request to kissanime.ru with path "'+path+'"');
  var newHeaders = req.headers;
  newHeaders.path = path;
  newHeaders.host = 'kissanime.ru';
  if(newHeaders.referer)newHeaders.referer = newHeaders.referer.replace(THIS_DOM, "kissanime.ru");
  var cookie = "";
  Object.keys(req.cookies).forEach((key)=>{
    cookie+=key+"="+req.cookies[key]+"; "
  });
  newHeaders.cookie = cookie;

  //temp
  //newHeaders.cookie = newHeaders.cookies+"cf_clearance=3e093569fc67cb62af79bf95c0583c2517408526-1522204302-28800"

  var interm = new stream.PassThrough();
  var options = {
    'hostname': newHeaders.host,
    'path': path,
    'headers': newHeaders,
    'method': 'POST'
  }
  var newreq = http.request(options, (res)=>{
    var total = new Buffer(0);
    res.on('data', (chunk)=>{
      total = Buffer.concat([total, chunk]);
    });
    res.on('end', ()=>{
      //console.log(' [' + num + '] -> Finished retrieving request.');
      DPS.addbetalink(res);
      copyresheader(res, newres);
      modifypostzipped(total, res, options, (dezipped)=>{
        interm.write(dezipped);
        interm.end();
      });
    });
  });
  // console.log(' [' + num + '] -> POST body: ' + JSON.stringify(req.body));
  //req.body = DPS.addbetalink(req.body);
  console.log(' [' + num + '] -> POST body: ' + JSON.stringify(req.body));
  newreq.write(querystring.stringify(req.body));
  newreq.end();
  interm.pipe(newres);
}

var addqueries = function(req){
  var path = req.path;
  var count = 0;
  Object.keys(req.query).forEach((key) =>{
    if(count == 0)path+="?";
    else path+="&";
    path += key + "=" + req.query[key];
    count++;
  })
  return path;
}

var copyresheader = function(oldres, newres){
  var headers = oldres.headers;
  var cookiedom = ".kissanime.ru";
  if(headers['set-cookie']) modcookiedomain(headers['set-cookie']);
  if(headers.location)headers.location = headers.location.replace("kissanime.ru", THIS_DOM);
  newres.writeHead(oldres.statusCode, headers);
}

var modcookiedomain = function(cookies){
  var domain = /domain=[^ ]{1,}/;
  cookies.forEach((cookie, index)=>{
    if(THIS_DOM.indexOf("localhost")!=-1){
      cookies[index] = cookie.replace(domain, "");
    }
    else{
      cookies[index] = cookie.replace(domain, "THIS_DOM");
    }
  });
}

var modifycfclear = function(buf, res){
  var t = buf.toString();
  if(t.indexOf('Please wait 5 seconds...')!=-1){
    t = t.replace('t = t.firstChild.href;', 't = "http://kissanime.ru/";');
    return t;
  }else{
    return buf;
  }
}

var modifygetzipped = function(buf, res, options, callback){
  if(res.headers['content-encoding'] != 'gzip') {
    callback(buf);
    return;
  }
  zlib.gunzip(buf, function(err, dezipped) {
    var content = dezipped.toString();

    //process
    content = DPS.replacelinks(content);
    if(res.headers['content-type'].indexOf('text/html')>-1 && !process.env.ByPass)content = DPS.processpage(content, options.path);

    if(process.env.ByPass)console.log(" Found length: "+content.length);

    dezipped = Buffer.from(content, 'utf8');
    zlib.gzip(dezipped, (err, zipped) => {
      callback(zipped);
    })
  })
}

var modifypostzipped = function(buf, res, options, callback){
  if(res.headers['content-encoding'] != 'gzip') {
    callback(buf);
    return;
  }
  zlib.gunzip(buf, function(err, dezipped) {
    var content = dezipped.toString();

    //process
    content = DPS.replacelinks(content);
    //console.log(content);

    dezipped = Buffer.from(content, 'utf8');
    zlib.gzip(dezipped, (err, zipped) => {
      callback(zipped);
    })
  })
}