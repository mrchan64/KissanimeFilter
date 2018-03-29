var jsdom = require('jsdom'),
    jquery = require('jquery');


exports.replacelinks = function(content){
  return content.split('kissanime.ru').join(exports.THIS_DOM);
}

exports.processpage = function(content, path){
  var page = new jsdom.JSDOM(content);
  var $ = jquery(page.window);

  addcustomcss($);

  //process
  if(path == '/'){
    changetitle1($);
    whitelistscripts1($);
    relocateelems1($);
  }//else if(path ==)

  return page.serialize();
}

var addcustomcss = function($){
  var css = $('<link href="/style/replace.css" rel="stylesheet" type="text/css">');
  var font = $('<link href="https://fonts.googleapis.com/css?family=Lato" rel="stylesheet">');
  $('head').append(css).append(font);
  $('link[href*="tpl"]').remove();
}

// for path '/'
var changetitle1 = function($){
  $('title').html('Anime Filter');
}

var whitelistscripts1 = function($){
  $('script').each((ind, el)=>{
    el = $(el);
    if(!(el.attr('src') && el.attr('src').indexOf('jquery')>-1) && el.html().indexOf('#imgSearch')==-1)el.remove();
  });
}

var relocateelems1 = function($){
  var bodyscripts = [];
  var body = $('body');
  $('script').each((ind, el)=>{
    if($.contains(body[0], el))bodyscripts.push(el);
  })
  var form = $('#search');
  body.empty().append(form);
  bodyscripts.forEach((script)=>{
    body.append(script);
  })
  $('#formSearch>div').each((ind, el)=>{
    el = $(el);
    if(el.attr('id')!='result_box')el.remove();
  })
  $('#result_box').attr('style', '');
  $('#keyword').attr('style', '').attr('placeholder', 'Input Anime Title');
  var prevententer = $('<script type="text/javascript">$("#keyword").keydown(function (e) { if(e.which == 13) {e.preventDefault(); alert("Please don\'t press enter :)")}})</script>');
  body.append(prevententer);
}