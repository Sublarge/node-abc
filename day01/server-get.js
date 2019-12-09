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