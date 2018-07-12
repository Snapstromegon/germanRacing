// const htmlparser = require('htmlparser2');

// const handler = new htmlparser.DomHandler((err, dom) => {
//   console.log(err, dom);
// })

// const parser = new htmlparser.Parser(handler);
// parser.write("<html><body><h1>Hallo</h1><p>Welt</p></body></html>");
// parser.end();

const raceCallenderReader = require('./readers/raceCallender');
const raceReader = require('./readers/race');
const fs = require('fs');
const { promisify } = require('util');
const graphCreator = require('./graphCreator');

const writeFile = promisify(fs.writeFile);

async function getData(force_load = false) {
  if(!force_load){
    try{
      const data = require('./data.json');
      console.log("using older data");
      return data;
    } catch(e) {}
  }else {
    console.log("forced reload");
  }

  const raceUrls = await raceCallenderReader.getRaceURLs({
    startDate: new Date("2017-01-01T00:00:00"),
    endDate: new Date("2017-12-31T00:00:00")
  });

  console.log(`Fetching data for ${raceUrls.length} races`);

  const races = [];
  for (let i=0; i<raceUrls.length; i++) {
    const promises = [];
    const parrallel = 5;
    for(let j=i; j<raceUrls.length && j<i+parrallel; j++) {
      console.log(`Fetching ${j}/${raceUrls.length}`);
      promises.push(raceReader.getRaceInfos(raceUrls[j]));
    }
    races.push(...await Promise.all(promises));
    i+=parrallel-1;
  }
  
  await writeFile('data.json', JSON.stringify(races));
  return races;
}

getData().then(data => {
  writeFile('graph.html', graphCreator.create(data));
  // console.log(data.filter(race => race.horses.filter(horse => horse.age == 2).length));
}).catch(console.error);