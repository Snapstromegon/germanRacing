const data = require('./data.json')
const fs = require('fs');
const result = [];
for(const dat of data){
  result.push(...dat);
}

fs.writeFile("data.json", JSON.stringify(result), console.log);
