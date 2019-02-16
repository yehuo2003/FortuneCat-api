// 招财猫点餐项目AIP子系统
const PORT = 8090;
const express = require('express');

var app = express();
app.listen(PORT, () => {
  console.log('Server Listening ' + PORT + '...');
})