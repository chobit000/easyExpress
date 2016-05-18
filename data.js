var listData = {
    datas : [
    {
      id : 1,
      title :  '第一篇'
    },
    {
      id : 2,
      title : '第二篇'
    },
    {
      id : 3,
      title : '第三篇'
    }]
}
var articleData = {
   "1" : "第一篇详情",
   "2" : "第二篇详情",
   "3" : "第三篇详情" 
}
module.exports.getList = function(fn){
  fn && fn(listData);
}
module.exports.getArticle = function(fn, index){
  fn && fn(articleData[index]);
}