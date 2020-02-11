// 招财猫点餐项目AIP子系统
const PORT = 8090;
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const category = require("./routes/admin/category");
const admin = require("./routes/admin/admin");
const dish = require("./routes/admin/dish");
const settings = require("./routes/admin/settings");
const table = require("./routes/admin/table");

// 创建HTTP应用服务器
const app = express();
app.listen(PORT, () => {
  console.log(`Server Listening: ${PORT}... `);
});

// 配置中间件
app.use(cors());
// app.use(bodyParser.urlencoded({}));//把application/x-www-form-urlencoded格式的请求主体数据解析出来放入req.body属性
app.use(bodyParser.json()); //把application/json格式的请求主体数据解析出来放入req.body属性

// 挂载管理后台必需路由器
app.use("/admin/category", category);
app.use("/admin", admin);
app.use("/admin/dish", dish);
app.use("/admin/settings", settings);
app.use("/admin/table", table);

// 挂载顾客App必需的路由器
app.use("/dish", dish);
