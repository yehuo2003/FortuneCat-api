// 管理员相关路由
const express = require('express');
const pool = require('../../pool');
const router = express.Router();

/*
*API: GET /admin/login
*请求数据：{aname: 'xxx', apwd: 'xxx'}
*完成用户登录验证
*返回数据：
* {code: 200,msg: 'login succ'}
* {code: 400,msg: 'aname or apwd err'}
*/
router.get('/login/:aname/:apwd', (req, res) => {
  var aname = req.params.aname;
  var apwd = req.params.apwd;
  // 需要对用户输入的密码执行加密函数
  pool.query('SELECT aid FROM cat_admin WHERE aname=? AND apwd=PASSWORD(?)', [aname, apwd], (err, result) => {
    if (err) throw err;
    if (result.length > 0) {
      res.send({ code: 200, msg: 'login succ' })
    } else if (result.length == 0) {
      res.send({ code: 400, msg: 'aname or apwd err' })
    }
  })
})

/*
*API: PATCH /admin/login  //修改部分数据用PATCH
*请求数据：{aname: 'xxx', oldPwd: 'xxx', newPwd: 'xxx'}
*根据管理员名和密码修改管理员密码
*返回数据：
* {code: 200,msg: 'modified succ'}
* {code: 400,msg: 'aname or apwd err'}
* {code: 401,msg: 'apwd not modified'}
*/
router.patch('/', (req, res) => {
  var aname = req.body.aname;
  var oldPwd = req.body.oldPwd;
  var newPwd = req.body.newPwd;
  // 首先根据aname/oldPwd查询该用户是否存在
  // 如果查询到了用户，再修改其密码
  pool.query('SELECT aid FROM cat_admin WHERE aname=? AND apwd=PASSWORD(?)', [aname, oldPwd], (err, result) => {
    if (err) throw err;
    if (result.length == 0) {
      res.send({ code: 400, msg: 'password err' })
      return;
    }
    // 如果查询到了用户，再修改其密码  
    pool.query('UPDATE cat_admin SET apwd=PASSWORD(?) WHERE aname=?', [newPwd, aname], (err, result) => {
      if (err) throw err;
      if (result.changedRows > 0) { //实际更新了一行
        res.send({ code: 200, msg: 'modified succ' });
      } else if (result.affectedRows == 0) {
        res.send({ code: 400, msg: 'aname or apwd err' });
      } else if (oldPwd == newPwd) { //影响到1行，但是修改了0行——新值与旧值完全一样
        res.send({ code: 401, msg: 'apwd not modified' });
      }
    })
  })
})
module.exports = router;