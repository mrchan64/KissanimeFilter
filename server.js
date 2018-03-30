var express = require('express'),
    http = require('http'),
    cookieParser = require('cookie-parser'),
    MPX = require('./lib/mostlyproxy');

var app = express();
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded());

app.get('/style/replace.css', (req, res)=>{
  console.log(' [*] Processing request for /style/replace.css');
  res.sendFile(__dirname+'/style.css')
})

app.get('/js/fadein.js', (req, res)=>{
  console.log(' [*] Processing request for /js/fadein.js');
  res.sendFile(__dirname+'/episodeFadeIn.js')
})

app.get('*', (req, res)=>{
  //res.sendFile(__dirname+'/index.html');
  MPX.getProxy(req, res);
})

app.post('*', (req, res)=>{
  MPX.postProxy(req, res);
})

var server = http.createServer(app);
server.listen(process.env.PORT || 3000);

console.log(" _______       _____                ________\n"+
" ___    |_________(_)______ __________  ___/__________________ _____________\n"+
" __  /| |_  __ \\_  /__  __ `__ \\  _ \\____ \\_  ___/_  ___/  __ `/__  __ \\  _ \\\n"+
" _  ___ |  / / /  / _  / / / / /  __/___/ // /__ _  /   / /_/ /__  /_/ /  __/\n"+
" /_/  |_/_/ /_//_/  /_/ /_/ /_/\\___//____/ \\___/ /_/    \\__,_/ _  .___/\\___/\n"+
"                                                               /_/");

