// 菜品类别相关路由
// 创建路由器
const express = require('express');
const pool = require('../../pool');
const router = express.Router();

/*
*API: GET / admin / category
*客户端获取所有的菜品类别，按编号升序排列
*返回值形如：
*[{ cid: 1, cname: '..' }, { ...}]
*/
router.get('/', (req, res) => {
  pool.query('SELECT * FROM cat_category ORDER BY cid', (err, result) => {
    if (err) throw err;
    res.send(result);
  })
})

/*
*API: DELETE /admin/category/:cid
*根据表示菜品编号的路由参数，删除该菜品
*返回值形如：
{ code: 200, msg: '1 category deleted' }
{ code: 400, msg: '0 category deleted' }
*/
router.delete('/:cid', (req, res) => {
  var cid = req.params.cid
  // 注意：删除菜品类别之前必须先把属于该类别的菜品类别编号设置为NULL
  pool.query('UPDATE cat_dish SET categoryId=NULL WHERE categoryId=?', cid, (err, result) => {
    if (err) throw err;
    // 至此指定类别的菜品已经修改完毕   
    pool.query('DELETE FROM cat_category WHERE cid=?', cid, (err, result) => {
      if (err) throw err;
      // 获取DELETE语句在数据库中影响的行数
      if (result.affectedRows > 0) {
        res.send({ code: 200, msg: '1 category deleted' });
      } else {
        res.send({ code: 400, msg: '0 category deleted' });
      }
    })
  })
})

/*
*API: POST / admin / category
*请求参数：{ cname: 'xxx' }
*添加新的菜品类别
*/
router.post('/', (req, res) => {
  var data = req.body;
  pool.query('INSERT INTO cat_category SET ?', data, (err, result) => {
    if (err) throw err;
    res.send({ code: 200, msg: '1 category added' });
  })
})

/*  
*API: PUT / admin / category
*请求参数：{ cid: xx, cname: 'xxx' }
*根据菜品类别编号修改该类别
*/
router.put('/', (req, res) => {
  var data = req.body; //请求数据{cid:xx,cname:'xx'}
  console.log(data)
  // TODO: 此处可以对数据进行验证
  pool.query('UPDATE cat_category SET ? WHERE cid=?', [data, data.cid], (err, result) => {
    if (err) throw err;
    if (result.changedRows > 0) { //实际更新了一行
      res.send({ code: 200, msg: '1 category modified' });
    } else if (result.affectedRows == 0) {
      res.send({ code: 400, msg: 'category not exits' });
    } else if (result.affectedRows == 1 && result.changedRows == 0) { //影响到1行，但是修改了0行——新值与旧值完全一样
      res.send({ code: 401, msg: 'no category modified' });
    }
  })
})

module.exports = router;