var jsdom = require('jsdom'),
    jquery = require('jquery');


exports.replacelinks = function(content){
  return content.split('kissanime.ru').join(exports.THIS_DOM);
}
exports.addbetalink = function(body){
  if(!body.reUrl)return body;
  var ind = body.reUrl.indexOf('&s=');
  if(ind>-1)body.reUrl = body.reUrl.substring(0,ind-1);
  body.reUrl += '&s=beta';
  return body
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
  }else if(path.substring(0,6).toLowerCase() == '/anime' && path.substring(7).indexOf('/')==-1){
    console.log('for anime page')
    changetitle2($);
    whitelistscripts2($);
    relocateelems2($);
  }

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
    if($.contains(body[0], el))bodyscripts.push($(el));
  })
  var form = $('#search');
  body.empty().append(form);
  bodyscripts.forEach((script)=>{
    var src = script.attr('src');
    script.removeAttr('src');
    $('body').append(script);
    if(src)script.attr('src', src);
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

var changetitle2 = function($){
  $('title').html('Filter: ' + $('#leftside>.bigBarContainer>.barContent>div>a.bigChar').html());
}

var whitelistscripts2 = function($){
  $('script').each((ind, el)=>{
    el = $(el);
    if(!(el.attr('src') && el.attr('src').indexOf('jquery')>-1))el.remove();
  });
  var script = $('<script type="text/javascript"></script>');
  $('body').append(script);
  script.attr('src', '/js/fadein.js');
  var script2 = $('<script type="text/javascript"></script>');
  $('head').append(script2);
  script2.attr('src', 'https://cdnjs.cloudflare.com/ajax/libs/jquery-easing/1.4.1/jquery.easing.min.js');
}

var relocateelems2 = function($) {
  var bodyscripts = [];
  var body = $('body');
  $('script').each((ind, el)=>{
    if($.contains(body[0], el))bodyscripts.push($(el));
  })
  var episodes = $('<div id=episodeContainer></div>');
  var as = $('.barContent.episodeList>div>.listing>tbody>tr>td>a');
  as.each((ind, el)=>{
    el = $(el);
    el.attr('href', el.attr('href')+'&s=beta');
  })
  episodes.append(as)
  var backtohome = $('<a id="backtohome" href="/">Return to Search Page</a>');
  backtohome = $('<p id=homecontainer></p>').append(backtohome);
  body.empty().append(backtohome).append(episodes);
  bodyscripts.forEach((script)=>{
    var src = script.attr('src');
    script.removeAttr('src');
    $('body').append(script);
    if(src)script.attr('src', src);
  })
}