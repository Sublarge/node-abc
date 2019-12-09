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