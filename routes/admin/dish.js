// 菜品相关路由
const express = require('express');
const pool = require('../../pool');
const router = express.Router();

/*
*API: GET /admin/dish
*获取所有的菜品（按类别进行分类）
*返回数据：
* [
*   {cid:1, cname:'肉类, dishList:[{},{},...]}
*   {cid:1, cname:'肉类, dishList:[{},{},...]}
*   ...
* ]
*/
router.get('/', (req, res) => {
  // 为了获得所有菜品，必须先查询所有菜品类别
  pool.query('SELECT cid,cname FROM cat_category ORDER BY cid', (err, result) => {
    if (err) throw err;
    var categoryList = result; //类别列表
    var count = 0;  //已经查询完成菜品类别的数量
    for (let c of categoryList) {
      // 循环查询每个类别下有多少菜品
      pool.query('SELECT * FROM cat_dish WHERE categoryId=? ORDER BY did DESC', c.cid, (err, result) => {
        if (err) throw err;
        c.dishList = result;
        count++;
        // 必须保证所有类别下的菜品都查询完成才能发送——这些查询都是异步执行的
        if (count == categoryList.length)
          res.send(categoryList)
      })
    }
  })
})

/*
*POST /admin/dish/image
*请求参数：
*接收客户端上传的菜品图片，保存在服务器上，返回该图片在服务器上的随机文件名
*/
// 引入multer中间件
const multer = require('multer');
const fs = require('fs');
var upload = multer({
  dest: 'tmp/'  //指定客户端上传的文件临时存储路径
})
// 定义路由，使用文件上传中间件
router.post('/image', upload.single('dishImg'), (req, res) => {
  // console.log(req.file);  //客户端上传的图片
  // console.log(req.body);  //随同图片提交的字符数据
  // 把客户端上传的文件从临时目录转义到永久的图片路径下
  var tmpFile = req.file.path; //临时文件名
  var suffix = req.file.originalname.substring(req.file.originalname.lastIndexOf('.')) //原始文件名中的后缀部分
  var newFile = randFileName(suffix); //目标文件名
  fs.rename(tmpFile, 'img/dish/' + newFile, () => {
    res.send({ code: 200, msg: 'upload succ', fileName: newFile }) //把临时文件转移
  })
});

// 生成一个随机文件名
// 参数：suffix表示要生成的文件名中的后缀
// 形如： 1355613232-8821.jpg
function randFileName(suffix) {
  var time = new Date().getTime();
  var num = Math.floor(Math.random() * (10000 - 1000) + 1000); //4位随机数字
  return time + '-' + num + suffix;
}

/*
*POST /admin/dish
*添加一个新的菜品
*/

module.exports = router;