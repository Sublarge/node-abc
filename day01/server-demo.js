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