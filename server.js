var express = require('express'),
    cookieParser = require('cookie-parser'),
    http = require('http'),
    stream = require('stream');

var app = express();
app.use(cookieParser());

const THIS_DOM = "localhost:3000";

app.get('*', (req, res)=>{
  //res.sendFile(__dirname+'/index.html');
  basicallyProxy(req, res);
})

app.post('*', (req, res)=>{
  console.log('A post was requested')
  res.end();
})

var server = http.createServer(app);
server.listen(process.env.PORT || 3000);

var basicallyProxy = function(req, newres){
  //var path = req.url.substring(6);
  var path = addqueries(req);
  console.log(' * Processing request to kissanime.ru with path "'+path+'"');
  var newHeaders = req.headers;
  newHeaders.path = path;
  newHeaders.host = 'kissanime.ru';
  if(newHeaders.referer)newHeaders.referer = newHeaders.referer.replace(THIS_DOM, "kissanime.ru"); 
  var interm = new stream.PassThrough();
  var options = {
    'hostname': newHeaders.host,
    'path': path,
    'headers': newHeaders
  }
  //console.log(options)
  var req = http.get(options, (res)=>{
    var total = "";
    res.on('data', (chunk)=>{
      total+=chunk;
    });
    res.on('end', ()=>{
      console.log(' * -> Finished retrieving request.')
      copyresheader(res, newres);
      interm.write(total);
      if(res.statusCode == 302){
        console.log(total)
      }
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
  headers['set-cookie'].forEach((cookie, index)=>{
    headers['set-cookie'][index] = cookie.replace(cookiedom, THIS_DOM);
  })
  if(headers.location)headers.location = headers.location.replace("kissanime.ru", THIS_DOM);
  newres.writeHead(oldres.statusCode, headers);
}