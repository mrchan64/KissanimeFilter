var jsdom = require('jsdom'),
    jquery = require('jquery');


exports.replacelinks = function(content){
  return content.split('kissanime.ru').join(exports.THIS_DOM);
}
exports.addbetalink = function(res){
  if(res.headers.location && res.headers.location.substring(0,6).toLowerCase() == '/anime'){
    res.headers.location += '&s=beta';
  }
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
    changetitle2($);
    whitelistscripts2($);
    relocateelems2($);
  }else if(path.split('?')[0].toLowerCase() == '/special/areyouhuman2'){
    changetitle3($);
    whitelistscripts3($);
    relocateelems3($);
  }else if(path.substring(0,7).toLowerCase() == '/anime/' && path.substring(7).split('?')[0].split('/').length==2){
    changetitle4($);
    whitelistscripts4($);
    relocateelems4($);
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

var changetitle3 = function($){
  $('title').html('Recaptcha :/');
}

var whitelistscripts3 = function($){
  $('script').each((ind, el)=>{
    el = $(el);
    if(!(el.attr('src') && el.attr('src').indexOf('jquery')>-1) && el.html().indexOf('countSelect')==-1)el.remove();
  });
}

var relocateelems3 = function($) {
  var bodyscripts = [];
  var body = $('body');
  $('script').each((ind, el)=>{
    if($.contains(body[0], el))bodyscripts.push($(el));
  })
  var captcha = $('#formVerify');
  captcha.find('div>p:contains("Please answer")').remove();
  captcha.find('div:contains("If images do not load")').remove();
  var redirect = captcha.find('[name="reUrl"]');
  //redirect.val(redirect.val()+"&s=beta");

  var backtohome = $('<a id="backtohome" href="/">Return to Search Page</a>');
  backtohome = $('<p id=homecontainer></p>').append(backtohome);
  body.empty().append(backtohome).append(captcha);
  bodyscripts.forEach((script)=>{
    var src = script.attr('src');
    script.removeAttr('src');
    $('body').append(script);
    if(src)script.attr('src', src);
  })
}

var changetitle4 = function($){
  $('title').html($('title').html().split('-')[0]);
}

var whitelistscripts4 = function($){
  $('script').each((ind, el)=>{
    el = $(el);
    if(!(el.attr('src') && (el.attr('src').indexOf('jquery')>-1 || el.attr('src').indexOf('vr.js')>-1 || el.attr('src').indexOf('css.js')>-1 || el.attr('src').indexOf('video-js')>-1 || el.attr('src').indexOf('videojs')>-1)) && el.html().indexOf('CryptoJS')==-1)el.remove();
  });
  var script = $('<script type="text/javascript"></script>');
  $('body').append(script);
  script.attr('src', '/js/runvid.js');
}

var relocateelems4 = function($) {
  var bodyscripts = [];
  var body = $('body');
  $('script').each((ind, el)=>{
    if($.contains(body[0], el))bodyscripts.push($(el));
  })
  var navbar = $('#selectEpisode').parent().parent();
  var episodes = $('#navsubbar');
  var video = $('#centerDivVideo');
  var qualix = $('#slcQualix');

  var text = episodes.find('a').html();
  episodes.find('a').html(text.replace('Anime ', '').replace(' information', '')+' Episode List');
  episodes.find('p').attr('id', 'eplist');

  video.attr('style', '');
  video.find('#divContentVideo').attr('style', '');
  video.find('#my_video_1').attr('height', 'auto').attr('width', '100%');

  var newnav = $('<div class="navbar"></div>');
  navbar.find('#selectEpisode').attr('style', '');
  newnav.append(navbar.find('#selectEpisode'));
  newnav.append(qualix);
  var previous = $('<a id="previous" class="navButton" style="opacity:.3;pointer-events:none;">Previous</a>');
  var next = $('<a id="next" class="navButton" style="opacity:.3;pointer-events:none;">Next</a>');
  newnav.prepend(previous).append(next);
  navbar.find('div>a').each((index, elem)=>{
    elem = $(elem);
    var img = elem.find('img')
    if(img.attr('id')=='btnPrevious'){
      previous.attr('href', elem.attr('href'));
      previous.removeAttr('style');
    }
    if(img.attr('id')=='btnNext'){
      next.attr('href', elem.attr('href'));
      next.removeAttr('style');
    }
  })

  var backtohome = $('<a id="backtohome" href="/">Return to Search Page</a>');
  backtohome = $('<p id=homecontainer></p>').append(backtohome);
  episodes.prepend(backtohome)
  body.empty().append(episodes).append(newnav).append(video);
  bodyscripts.forEach((script)=>{
    var src = script.attr('src');
    script.removeAttr('src');
    $('body').append(script);
    if(src)script.attr('src', src);
  })
}