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

![avatar][base64str]

data:image/png;base64,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5lhcRJ8kSs5y8iDhTjOTwCa/X/8A4ej/ALMX/RTf/KBqn/yNX4A0UAFFFFABXv8A+wV8UvDHwW/ax8DeMvGWp/2N4b037d9rvfs8s/l+ZYXESfJErOcvIg4U4zk8AmvAKKAP3+/4ej/sxf8ARTf/ACgap/8AI1H/AA9H/Zi/6Kb/AOUDVP8A5Gr8AaKAP6ffhb8UvDHxp8CaZ4y8G6n/AGz4b1Lzfsl79nlg8zy5Xif5JVVxh43HKjOMjgg1+a3/AAXO/wCaJ/8Acb/9sK+qv+CXH/Jifwy/7if/AKdLuvlX/gud/wA0T/7jf/thQB+VdFFFABX7/f8ABLj/AJMT+GX/AHE//Tpd1+ANfv8Af8EuP+TE/hl/3E//AE6XdAH1VXKfFL4peGPgt4E1Pxl4y1P+xvDem+V9rvfs8s/l+ZKkSfJErOcvIg4U4zk8Amurr5V/4Kj/APJifxN/7hn/AKdLSgA/4ej/ALMX/RTf/KBqn/yNX5V/8OuP2nf+iZf+V/S//kmvlWv6qKAPn/8AYK+Fvif4LfsneBvBvjLTP7G8Sab9u+12X2iKfy/Mv7iVPniZkOUkQ8McZweQRXgH/BVv9lz4n/tKf8Ku/wCFceGf+Ej/ALF/tT7f/p9ra+T532Tyv9fKm7PlSfdzjbzjIz9/0UAfzrfFL9gr47fBbwJqfjLxl4G/sbw3pvlfa73+17Cfy/MlSJPkinZzl5EHCnGcngE14BX7/f8ABUf/AJMT+Jv/AHDP/TpaV+ANAH9VFfP/AMUv29fgT8FvHep+DfGXjn+xvEmm+V9rsv7Iv5/L8yJJU+eKBkOUkQ8McZweQRX0BX4A/wDBUf8A5Ps+Jv8A3DP/AE12lAH6qf8AD0f9mL/opv8A5QNU/wDkavn/APb1/b1+BPxp/ZO8c+DfBvjn+2fEmpfYfsll/ZF/B5nl39vK/wA8sCoMJG55YZxgckCvyBooAK/qor+Vev6qKACvyr/4Lnf80T/7jf8A7YV+qlflX/wXO/5on/3G/wD2woA+Kv2Cvil4Y+C37WPgbxl4y1P+xvDem/bvtd79nln8vzLC4iT5IlZzl5EHCnGcngE1+v8A/wAPR/2Yv+im/wDlA1T/AORq/AGigD+qiiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigAooooA//9k=

