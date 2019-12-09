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