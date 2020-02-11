var express = require('express');
var url = require('url');
var fs = require('fs');
var http = require('http');
var queryString = require('querystring');
var bodyParser = require('body-parser');
var path=require('path'); 
 
var app = express();
 
app.use(bodyParser.json({limit:'1000kb'}));
app.use(bodyParser.urlencoded({limit:'1000kb',extended:true}));
 
var count=0;
app.get('/test', function(req, res) {
	res.send({ code: 400, msg: 'aname or apwd err' });
}) 
app.post('/upload.node',function(req,resp){
	console.log('上传请求 '+ (new Date()));
	var data = new Buffer(req.body.fileData,'base64');
	var filePath = req.body.filePath;
	var pathObj = path.parse(filePath);//对文件路径字符串进行操作
	
	var responseBody = {};
	mkdirsSync(pathObj.dir);//递归创建文件目录
	try{
		var writerStream = fs.createWriteStream(filePath);
		writerStream.write(data);	
		writerStream.end();
		
		writerStream.on('finish', function() {
			console.log('上传完成 '+ (new Date()));
		});
		writerStream.on('error', function(err){
			console.log(err.stack);
		});
		responseBody=JSON.stringify({
			returnMsg:'200'
		});
	}catch(err){
		console.log('上传出错 '+ (new Date()));
		responseBody=JSON.stringify({
			returnMsg:'400'
		});
	}
	//写入文件
	
	//console.log('*** ' + count +' ***');
    resp.status(200).end(responseBody.toString());
});
 
app.post('/download.node',function(req,resp){
	console.log('下载请求 '+ (new Date()));
	var filePath = req.body.filePath;
	console.log('download');
	var responseBody = {};
	if(fs.existsSync(filePath)){
		var data = fs.readFileSync(filePath);
		var dataBase64 = data.toString('base64');
		responseBody = JSON.stringify({
			returnMsg:'200',
			filePath:filePath,
			fileData:dataBase64
		});
		console.log('下载完成 '+ (new Date()));
	}else{
		responseBody=JSON.stringify({
			returnMsg:'400'
		});
		console.log('文件未找到 '+ (new Date()));
	}
	//console.log('*** ' + ++count +' ***');
	resp.status(200).end(responseBody.toString());
});
 
//递归创建文件目录 同步方法
function mkdirsSync(filePath){
	if(fs.existsSync(filePath)){
		return true;
	}else{
		if(mkdirsSync(path.dirname(filePath))){
			fs.mkdirSync(filePath);
			return true;
		}
	}
}
 
 
var server = app.listen(3000,function(){
	
	console.log('Server started.');
})