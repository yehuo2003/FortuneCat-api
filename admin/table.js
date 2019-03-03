// 桌台信息设置
const express = require('express');
const pool = require('../../pool');
const router = express.Router();

/*
*GET / admin / settings
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
*PUT / admin / settings
*获取所有的全局设置信息
*返回数据：
*  {code:200, msg: 'settings updated succ'}
*/
router.put('/', (req, res) => {
  pool.query('UPDATE cat_settings SET ?', req.body, (err, result) => {
    if (err) throw err;
    res.send({ code: 200, msg: 'settings updated succ' })
  })
})

module.exports = router;