var http = require('http'),
    zlib = require('zlib'),
    stream = require('stream');

const THIS_DOM = "localhost:3000";



exports.getProxy = function(req, newres){
  //var path = req.url.substring(6);
  var path = addqueries(req);
  console.log(' * Processing request to kissanime.ru with path "'+path+'"');
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
  console.log("\n", "IN\n", newHeaders, "\n");
  //console.log(options)
  var req = http.get(options, (res)=>{
    var total = new Buffer(0);
    res.on('data', (chunk)=>{
      total = Buffer.concat([total, chunk]);
    });
    res.on('end', ()=>{
      console.log(' * -> Finished retrieving request.')
      total = modifycfclear(total, res);
      copyresheader(res, newres);
      interm.write(total);
      interm.end();
    });
  });
  req.end();
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
  console.log("\n", "OUT\n", headers, "\n");
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
    console.log("ITS THE THING");
    t = t.replace('t = t.firstChild.href;', 't = "http://kissanime.ru/";');
    return t;
  }else{
    return buf;
  }
}

var modifyzipped = function(buf, res){
  if(response.headers['content-encoding'] != 'gzip') return buf.toString();
  zlib.gunzip(body, function(err, dezipped) {

  })
}