var jsdom = require('jsdom'),
    jquery = require('jquery');


exports.replacelinks = function(content){
  return content.split('kissanime.ru').join(exports.THIS_DOM);
}

exports.processpage = function(content){
  var page = new jsdom.JSDOM(content);
  var $ = jquery(page.window);

  //process
  changetitle($);
  whitelistscripts($);
  relocateelems($);
  console.log('processed slash')

  return page.serialize();
}

var changetitle = function($){
  $('title').html('Anime Filter');
}

var whitelistscripts = function($){
  $('script').each((ind, el)=>{
    el = $(el);
    if(!(el.attr('src') && el.attr('src').indexOf('jquery')>-1) && el.html().indexOf('#imgSearch')==-1)el.remove();
  });
}

var relocateelems = function($){
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
}