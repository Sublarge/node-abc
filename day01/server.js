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