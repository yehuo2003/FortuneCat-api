// 桌台信息设置
const express = require('express');
const pool = require('../../pool');
const router = express.Router();

/*
*GET / admin / table
*获取所有的桌台信息
*返回数据：
*  [
  {tid: xxx, tname: 'xxx', status: ''},
  ...
]
*/
router.get('/', (req, res) => {
  pool.query('SELECT * FROM cat_table ORDER BY tid', (err, result) => {
    if (err) throw err;
    res.send(result)
  })
})

/*
*API: POST / admin / table
*请求参数：{ tname: xxx, type: "x人桌", status: x}
*添加新的菜品类别
*/
router.post('/', (req, res) => {
  var data = req.body;
  pool.query('INSERT INTO cat_table SET ?', data, (err, result) => {
    if (err) throw err;
    res.send({ 
	  code: 200,
	  msg: '1 table added',
	  tid: result.insertId		
	});
  })
})

/*
*API: DELETE / admin / table / :tid
*根据表示桌台编号的路由参数，删除该桌台信息
*返回值形如：
{ code: 200, msg: '1 table deleted' }
{ code: 400, msg: '0 table deleted' }
*/
router.delete('/:tid', (req, res) => {
  var tid = req.params.tid;
  // 至此指定类别的菜品已经修改完毕   
  pool.query('DELETE FROM cat_table WHERE tid=?', tid, (err, result) => {
  if (err) throw err;
    // 获取DELETE语句在数据库中影响的行数
    if (result.affectedRows > 0) {
	  res.send({ code: 200, msg: '1 table deleted' });
    } else {
	  res.send({ code: 400, msg: '0 table deleted' });
    }
  })
})
/*
*PUT / admin / table
*获取所有的全局设置信息
*返回数据：
*  {code:200, msg: 'table updated succ'}
*/
router.put('/', (req, res) => {
  var data = req.body; //请求数据 {tid: 1, tname: "金镶玉", type: "2人桌", status: 1}
  pool.query('UPDATE cat_table SET ? WHERE tid=?', [data, data.tid], (err, result) => {
    if (err) throw err;
    if (result.changedRows > 0) { //实际更新了一行
      res.send({ code: 200, msg: '1 table modified' });
    } else if (result.affectedRows == 0) {
      res.send({ code: 400, msg: 'table not exits' });
    } else if (result.affectedRows == 1 && result.changedRows == 0) { //影响到1行，但是修改了0行——新值与旧值完全一样
      res.send({ code: 401, msg: 'no table modified' });
    }
  })
})

module.exports = router;