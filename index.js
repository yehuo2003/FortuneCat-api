// 招财猫点餐项目AIP子系统
const PORT = 8090;
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const category = require('./routes/admin/category');
const admin = require('./routes/admin/admin');

// 创建HTTP应用服务器
const app = express();
app.listen(PORT, () => {
  console.log(`Server Listening: ${PORT}... `);
});

// 配置中间件
app.use(cors());
// app.use(bodyParser.urlencoded({}));//把application/x-www-form-urlencoded格式的请求主体数据解析出来放入req.body属性
app.use(bodyParser.json());//把application/json格式的请求主体数据解析出来放入req.body属性

// 挂载路由器
app.use('/admin/category', category);
app.use('/admin', admin);