# Nodejs快速入门

## 										----挑战七天入门全栈工程师

#### day 01

## 什么是nodejs

运行在服务端的js

## 可能是最重要的两个模块

+ fs
+ http

### fs 文件操作

```javas
// 写文件 fs-write.js
const fs = require('fs');

fs.writeFile('./a.txt','hello world',err => {
    if (err){
        console.log(err);
    }else {
        console.log('success');
    }
});
```

```javas
// 读文件 fs-read.js
const fs = require('fs');

fs.readFile('./a.txt',(err,data)=>{
    if(err){
        console.log(err)
    }else{
        console.log(data);
    }
});
```

基本的读写操作如上所示, 配合即将演示的http就能实现文件的上传和下载了.

### http 服务器

```javascr
// server.js
const http= require('http');

let server = http.createServer(function (req,res) {
    console.log(req.url);
    res.write("This is a http server in node");
    res.end();
});

server.listen(8080);
```

启动,然后打开浏览器 访问 http://localhost:8080/ 即可访问我们的服务器

上面可能是最简单的服务器程序了, 打印了请求的url,并且向客户端返回了一句话. ```res.end()```用来关闭对服务端的输出流,表示数据已经写完.

### 组合fs 和 http 实现网页的返回 

1. 先创建一个简单的页面 www/html:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Title</title>
</head>
<body>
<h1>Index</h1>
</body>
</html>
```

2. 根据url里的文件名,去www文件夹读取并返回文件:

   ```javasc
   // server.js
   const http= require('http');
   const fs = require('fs');
   let server = http.createServer(function (req,res) {
       console.log(req.url);
       fs.readFile(`www${req.url}`,(err, data) => {
           if (err){
               res.writeHeader(404);
               res.write('Not Found');
               res.end();
           }else {
               res.write(data);
               res.end();
           }
       });
   });
   
   server.listen(8080);
   ```

   writeHeader用来指明 http状态码

访问 http://localhost:8080/index.html 即可看到内容

### 解析GET请求

1. 先来一个表单:  /www/form-get.html

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Get</title>
</head>
<body>
<h1>Get</h1>
<form action="http://localhost:8080/form" method="get">
    username<input type="text" name="username"><br>
    password<input type="password" name="password"><br>
    <input type="submit">
</form>
</body>
</html>
```

2. 服务端:

   ```javascr
   // server-get.js
   const http = require('http');
   const fs = require('fs');
   const querystring = require('querystring');
   const url = require('url');
   
   let server = http.createServer(function (req, res) {
       console.log(req.url);
       let [get_url, query] = req.url.split('?');
       let get = querystring.parse(query);
       console.log(get_url, get);
   
   
       let parsedUrl = url.parse(req.url, true);
       console.log(parsedUrl.query);
   
       res.end();
   });
   
   server.listen(8080);
   ```

   querystring 和 url 是nodejs提供的两种不同的解析url的库, 哪个顺手用哪个就行,代码只是工具.

   ### 解析POST请求[文本数据]

   1. 同样,先来个post表单: /www/form-post.html

      ```html
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <title>Post</title>
      </head>
      <body>
      <h1>Post</h1>
      <form action="http://localhost:8080/form" method="post">
          username<input type="text" name="username"><br>
          password<input type="password" name="password"><br>
          <input type="submit">
      </form>
      </body>
      </html>
      ```

   2. 与GET请求不同,POST请求的数据可以很大,所以不一定能一次全部得到,所以服务端会有两个事件,  data 和 end 分别代表 数据到达 和 数据全部到达

      ```javasc
      // server-post.js
      const http = require('http');
      const fs = require('fs');
      const querystring = require('querystring');
      const url = require('url');
      
      let server = http.createServer(function (req, resp) {
          let arr = [];
          req.on('data', buffer => {
              arr.push(buffer);
              console.log(buffer);
          });
          req.on('end', () => {
              console.log('end:', Buffer.concat(arr).toString());
              resp.end();
          });
      });
      
      server.listen(8080);
      ```

      值得注意的是, post发送来的二进制数据不一定代表字符串,所以像示例代码中那样直接拼接后转成字符串并不可取, 而且接收到的数据直接放在内存数组里也不太好.不过这里只是一个示例,后面会有更好的策略.

      

      ### 同时支持GET和POST的服务器

      我们的服务器目前只能处理一种请求, 通过http请求中的method可以加以区分, 从而实现在同一个服务器程序里处理GET和POST请求.

      ```javascr
      // server-total.js
      const http = require('http');
      const fs = require('fs');
      const querystring = require('querystring');
      const url = require('url');
      
      let server = http.createServer(function (req, resp) {
          let path = '', get = {}, post = {};
          if (req.method == 'GET') {
              let {pathname, query} = url.parse(req.url, true);
              path = pathname;
              get = query;
              complete();
          } else if (req.method == 'POST') {
              let arr = [];
              req.on('data', buffer => {
                  arr.push(buffer);
              });
              req.on('end', () => {
                  path = req.url;
                  post = querystring.parse(Buffer.concat(arr).toString());
                  complete();
              });
          }
      
          function complete() {
              console.log(path, get, post);
              resp.end();
          }
      });
      
      server.listen(8080);
      ```

      通过简单的if判断,对请求进行分发.

      ### 登录注册案例

      ```javascript
      const http = require('http');
      const fs = require('fs');
      const querystring = require('querystring');
      const url = require('url');
      
      let users = {};
      let server = http.createServer(function (req, resp) {
          let path = '', get = {}, post = {};
          if (req.method == 'GET') {
              let {pathname, query} = url.parse(req.url, true);
              path = pathname;
              get = query;
              complete();
          } else if (req.method == 'POST') {
              let arr = [];
              req.on('data', buffer => {
                  arr.push(buffer);
              });
              req.on('end', () => {
                  path = req.url;
                  post = querystring.parse(Buffer.concat(arr).toString());
                  complete();
              });
          }
      
          function complete() {
              console.log(path, get, post);
              if (path == '/reg') {
                  let {username, password} = get;
                  if (users[username]) {
                      resp.write(JSON.stringify({err: 1, msg: 'user existed'}));
                  } else {
                      users[username] = password;
                      resp.write(JSON.stringify({err: 0, msg: 'register success'}));
                  }
                  resp.end();
              } else if (path == '/login') {
                  let {username, password} = get;
                  if (!users[username] || users[username] != password) {
                      resp.write(JSON.stringify({err: 1, msg: 'user not existed or password failed'}));
                  } else {
                      resp.write(JSON.stringify({err: 0, msg: 'login success'}));
                  }
                  resp.end();
              } else {
                  fs.readFile(`www${req.url}`, (err, data) => {
                      if (err) {
                          resp.writeHeader(404);
                          resp.write('Not Found');
                      } else {
                          resp.write(data);
                      }
                      resp.end();
                  });
              }
          }
      });
      
      server.listen(8080);
      ```

      上面的代码通过method和url对请求处理进行了分发.不难看出, 如果请求继续增加下去, 代码会变得很恶心. 不过好在之后会介绍到解决方案,也就是router. 不过不要把它想的太神奇, 只不过是通过 字符串匹配的方式, 把url 对应到处理函数而已.



## 说明

本人打算陆续进行周学习计划, 范围在计算机科学,物理学,数学等多个方面. 有想一起的小伙伴, 或者, 有某些有趣的学科想要推荐的,再或者文中有错误需要指正的, 再再或者只是单纯想联系我的 都欢迎  (๑╹ヮ╹๑)ﾉ 微信哦

![avatar](./wechat.png)

