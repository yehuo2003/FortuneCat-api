// 招财猫全局设置
const express = require('express');
const pool = require('../../pool');
const router = express.Router();

/*
*GET / admin / settings
*获取所有的全局设置信息
*返回数据：
*  {appName:'xx',adminUrl:'xx',appUrl:'xx',...}
*/
router.get('/', (req, res) => {
  pool.query('SELECT * FROM cat_settings LIMIT 1', (err, result) => {
    if (err) throw err;
    res.send(result[0])
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