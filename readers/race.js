const https = require('https');
const htmlparser = require('htmlparser2');
const Horse = require('../class/Horse');
const Race = require('../class/Race');

const domUtils = htmlparser.DomUtils;

function getDom(url) {
  return new Promise((resolve, reject) => {

    const domHandler = new htmlparser.DomHandler((err, dom) => {
      if (err) {
        reject(err);
      } else {
        resolve(dom);
      }
    })
    const parser = new htmlparser.Parser(domHandler);
    https.get(url, res => res.pipe(parser))
  });
}

function isHorseInfo(domNode) {
  if (domNode.name != "span") return false;
  if (!domNode.attribs.class) return false;
  if (!domNode.attribs.title) return false;
  if (!domNode.attribs.title.match(/Alter[^\d]*(\d+)[^\d]*Jahre/)) return false;
  if (domNode.children[0].data.match(/&/)) return false;
  if (domNode.attribs.class.indexOf('name') != -1) return false;
  return domNode.attribs.class.indexOf('tooltip') != -1;
}

function parseHorseInfo(domInfo) {
  const name = domInfo.children[0].data;
  const age = domInfo.attribs.title.match(/Alter[^\d]*(\d+)[^\d]*Jahre/)[1] | 0;

  return new Horse(name, age);
}

function findClass(node, className){
  if (node.name != "span") return false;
  if (!node.attribs.class) return false;
  return node.attribs.class.indexOf(className) != -1;
}

function dateStringToDate(dateString){
  const ret = new Date();
  const parts = dateString.split(', ');
  const dateParts = parts[0].split('.');
  ret.setDate(dateParts[0]);
  ret.setMonth(dateParts[1]-1);
  ret.setFullYear(dateParts[2]);
  if(parts.length > 1){
    const timeParts = parts[1].split(':');
    ret.setHours(timeParts[0]);
    ret.setMinutes(timeParts[1]);
  }
  return ret;
}

async function getRaceInfos(url) {
  console.log("requesting: ", url);
  const dom = await getDom(url);
  const domHorseInfos = domUtils.findAll(isHorseInfo, dom);

  const raceName = domUtils.findAll(node => findClass(node, "racetitle"), dom)[0].children[0].data;
  const raceTrack = domUtils.findAll(node => findClass(node, "racetrack"), dom)[0].children[0].data;
  const raceDateString = domUtils.findAll(node => findClass(node, "startzeit"), dom)[0].children[0].data;
  console.log(raceDateString);
  const raceDate = dateStringToDate(raceDateString);

  const raceInfoCandidates = domUtils.findAll(node => findClass(node, "header-right"), dom);

  const domPrice = raceInfoCandidates.filter(node => node.children[0].data.match(/€/))[0];
  const price = domPrice ? parseInt(domPrice.children[0].data.replace('.', '')) : 0;
  const domDistance = raceInfoCandidates.filter(node => node.children[0].data.match(/ m$/))[0];
  const distance = domDistance ? parseInt(domDistance.children[0].data.replace('.', '')) : 0;

  const race = new Race(raceName, raceDate, raceTrack, distance, price);

  race.addHorse(...domHorseInfos.map(parseHorseInfo));

  return race;
}

module.exports = {
  getRaceInfos
}