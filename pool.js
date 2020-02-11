// MySQL数据库连接池
const mysql = require('mysql');
// 创建连接池对象
var pool = mysql.createPool({
  host: '127.0.0.1',      //数据库地址
  user: 'root',           //数据库管理员
  password: '',           //数据库管理员密码
  database: 'FortuneCat', //默认连接数据库
  port: 3306,             //数据库端口
  connectionLimit: 10     //连接池中连接数量
});

module.exports = pool;