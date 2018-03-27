var express = require('express'),
    cookieParser = require('cookie-parser'),
    http = require('http'),
    stream = require('stream');

var app = express();
app.use(cookieParser());

app.get('*', (req, res)=>{
  //res.sendFile(__dirname+'/index.html');
  basicallyProxy(req).pipe(res);
})

app.post('*', (req, res)=>{
  console.log('A post was requested')
  res.end();
})

var server = http.createServer(app);
server.listen(process.env.PORT || 3000);

var basicallyProxy = function(req){
  //var path = req.url.substring(6);
  var path = addqueries(req);
  console.log(' * Processing request to kissanime.ru with path "'+path+'"');
  var newHeaders = req.headers;
  newHeaders.path = path;
  newHeaders.host = 'kissanime.ru';
  var interm = new stream.PassThrough();
  var options = {
    'hostname': newHeaders.host,
    'path': path,
    'headers': newHeaders
  }
  var req = http.get(options, (res)=>{
    var total = "";
    res.on('data', (chunk)=>{
      total+=chunk;
    });
    res.on('end', ()=>{
      console.log(' * -> Finished retrieving request.')
      interm.write(total);
      interm.end();
    });
  });
  req.end();
  return interm;
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