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
//router.post('/image', upload.single('dishImg'), (req, res) => {
router.post('/image', upload.single(), (req, res) => {
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
};

/*
*POST /admin/dish
*请求参数：{title:'xx',imgUrl:'..jpg',price:xx,detail:'xx',categoryId:xx}
*添加一个新的菜品
*输出消息：
* {code:200, msg:'dish added succ',dishId:46}
*/
router.post('/', (req, res) => {
  pool.query('INSERT INTO cat_dish SET ?', req.body, (err, result) => {
    if (err) throw err;
    res.send({ code: 200, msg: 'dish added succ', dishId: result.insertId }) //将INSERT语句产生的自增编号输出给客户端
  })
});



//以下两个未测试
/*
*DELETE /admin/dish/:did
*根据指定的菜品编号删除该菜品
*输出数据：
* {code:200, msg:'1 dish deleted'}
*/
router.delete('/:did', (req, res) => {
    var did = req.params.did;
    pool.query('DELETE FROM cat_dish WHERE did=?', (err, result) => {
        if (err) throw err;
        // 获取DELETE语句在数据库中影响的行数
        if (result.affectedRows > 0) {
            res.send({ code: 200, msg: '1 dish deleted' });
        } else {
            res.send({ code: 400, msg: '0 dish deleted' });
        }
    })
})
/*
*PUT /admin/dish
*请求参数：{did:'xx',title: 'xx',imgUrl:'..jpg',price:xx,detail:'xx',categoryId:xx}
*根据指定的菜品编号修改菜品
*输出数据：
* {code:200, msg:'dish updated succ'}
* {code:400, msg:'dish not exists'}
*/
router.put('/', (err, res) => {
    var data = req.body;
    pool.query('UPDATE cat_dish SET ? WHERE did = ?', [data, data.did], (err, result) => {
        if (err) throw err;
        if (result.changedRows > 0) { //实际更新了一行
            res.send({ code: 200, msg: 'dish updated succ' });
        } else if (result.affectedRows == 0) {
            res.send({ code: 400, msg: 'dish not exists' });
        } else if (result.affectedRows == 1 && result.changedRows == 0) { //影响到1行，但是修改了0行——新值与旧值完全一样
            res.send({ code: 401, msg: 'no dish modified' });
        }
    })
})

module.exports = router;