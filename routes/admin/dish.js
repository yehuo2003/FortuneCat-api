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
/*
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
*/

//	做分页效果
  var curPage = Number(req.query.curPage);  //当前页码
  var pageSize = Number(req.query.pageSize);//页大小
  var categoryId = req.query.categoryId;	//菜品类别id
  var title = req.query.title;	//菜品名称
  var sort = req.query.sort;
  //2.设置参数默认值
  if (!curPage) {
    curPage = 1;
  }
  if (!pageSize) {
    pageSize = 10;
  }
  //3.验证用户输入
  var reg = /^[0-9]{1,}$/;
  if (!reg.test(curPage)) {
    res.send({ code: -1, msg: "页码格式不正确" });
    return;
  }
  if (!reg.test(pageSize)) {
    res.send({ code: -2, msg: "页大小格式不正确" });
    return;
  }
  var progress = 0;
  var obj = { code: 1 };

  //4.创建两条sql发送 总记录数
  //4.1创建空对象保存返回数据
  var obj = { pageSize };
  //4.2创建变量保存(sql语句完成)进度
  var progress = 0;
    //查询功能 提供菜品类别 和 按菜品搜索
  var category = "";
  if (categoryId && title) {
	category = `WHERE categoryId=${categoryId} and title like "%${title}%"`
  } else if (categoryId) {
	category = `WHERE categoryId=${categoryId}`
  } else if (title) {
	category = `WHERE title like "%${title}%"`
  }
  var sql = " SELECT count(did) AS c FROM cat_dish " + category;
  pool.query(sql, (err, result) => {
    if (err) throw err;
    var pageCount = Math.ceil(result[0].c / pageSize);
    obj.pageCount = pageCount;//保存总页数
	obj.total = result[0].c;  //保存总条数	
    progress += 50;           //保存当前进度
    if (progress == 100) {      //二条sql完成
      res.send({ code: 200, data: obj })//发送结果
    }
  })

  //5.创建第二条sql语句 当前页内容
  if (sort == 1) {
    //如果sort等于1，执行价格升序
    var sql = ` SELECT did,title,price,categoryId FROM cat_dish ${category} ORDER BY price ASC LIMIT ?,?`;
  } else if (sort == 2) {
    //如果sort等于2，按价格降序
    var sql = " SELECT did,title,price,categoryId FROM cat_dish ORDER BY price ASC LIMIT ?,?";
  } else {
	//默认按id降序(最新添加在放在前边)	
    var sql = ` SELECT did,title,price,categoryId FROM cat_dish ${category} ORDER BY did DESC LIMIT ?,?`;
  }
  var offset = parseInt((curPage - 1) * pageSize);
  pageSize = parseInt(pageSize);
  pool.query(sql, [offset, pageSize], (err, result) => {
    if (err) throw err;
    obj.data = result;     //保存当前页内容
    progress += 50;     //进度加50
    if (progress == 100) {//如果二条sql语句全部完成
      //6.将数据json发送
      res.send({ code: 200, data: obj })
    }
  })
})

/*
*GET /admin/dish/:did
*请求参数：
*根据菜品id, 查询出对应的菜品
*/
router.get('/:did', (req, res) => {
	var did = req.params.did
    pool.query('SELECT did,title,price,detail,imgUrl,categoryId FROM cat_dish WHERE did=?', did, (err, result) => {
		if (err) throw err;
		if (result.length) {
			res.send(result[0]);
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
    res.send({ code: 200, msg: 'upload img succ', fileName: newFile }) //把临时文件转移
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

/*
*DELETE /admin/dish/:did
*根据指定的菜品编号删除该菜品
*输出数据：
* {code:200, msg:'dish added succ',dishId:46}
*/
router.delete('/:did', (req, res) => {
  var did = req.params.did
  pool.query('DELETE FROM cat_dish WHERE did=?', did, (err, result) => {
    if (err) throw err;
    // 获取DELETE语句在数据库中影响的行数
    if (result.affectedRows > 0) {
      res.send({ code: 200, msg: 'dish added succ' });
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
router.put('/', (req, res) => {
  var data = req.body;
  pool.query('UPDATE cat_dish SET ? WHERE did=?', [data, data.did], (err, result) => {
    if (err) throw err;
    if (result.changedRows > 0) { //实际更新了一行
      res.send({ code: 200, msg: 'dish updated succ' });
    } else if (result.affectedRows == 0) {
      res.send({ code: 400, msg: 'dish not exists' });
    } else if (result.affectedRows == 1 && result.changedRows == 0) { //影响到1行，但是修改了0行——新值与旧值完全一样
      res.send({ code: 401, msg: 'no dish modified' });
    }
  })
});

module.exports = router;