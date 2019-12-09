const fs = require('fs');


fs.readFile('./a.txt',(err,data)=>{
    if(err){
        console.log(err)
    }else{
        console.log(data);
    }
});