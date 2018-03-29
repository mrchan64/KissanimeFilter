
exports.replacelinks = function(content){
  return content.split('kissanime.ru').join(exports.THIS_DOM);
}