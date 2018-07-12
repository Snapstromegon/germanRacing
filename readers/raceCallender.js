const https = require('https');
const htmlparser = require('htmlparser2');

const MONTHS = ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"]

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

function isRaceUrl(domNode) {
  if (domNode.name != "a") return false;
  if (!domNode.parent) return false;
  if (!domNode.parent.parent) return false;
  if (!domNode.parent.parent.attribs.class) return false;
  if (domNode.parent.parent.attribs.class.indexOf('rennen') == -1) return false;
  return domNode.attribs.href.indexOf('rennen.php') != -1;
}

async function getRaceURLs({ startDate, endDate, country = 8, minLength = 1000, maxLength = 6800 }={}, baseUrl = "https://www.german-racing.com/gr/renntage/rennkalender.php") {
  url = baseUrl + "?";

  if (country) { url += `land=${country}&`; }
  if (minLength) { url += `laengevon=${minLength}&`; }
  if (maxLength) { url += `laengebis=${maxLength}&`; }
  if (startDate) { 
    const year = startDate.getFullYear();
    const month = (startDate.getMonth()+1<10?"0":"")+(startDate.getMonth()+1);
    const day = (startDate.getDate()<10?"0":"")+(startDate.getDate());
    url += `jahr=${year}&`; 
    url += `von=${day}.+${MONTHS[startDate.getMonth()]}+${year}&`;
    url += `von_submit=${year}%2F${month}%2F${day}&`;
  }
  if (endDate) { 
    const year = endDate.getFullYear();
    const month = (endDate.getMonth()+1<10?"0":"")+(endDate.getMonth()+1);
    const day = (endDate.getDate()<10?"0":"")+(endDate.getDate());
    url += `jahr=${year}&`; 
    url += `bis=${day}.+${MONTHS[endDate.getMonth()]}+${year}&`;
    url += `bis_submit=${year}%2F${month}%2F${day}&`;
  }
  console.log("requesting: ", url);
  const dom = await getDom(url);
  const matchingAs = htmlparser.DomUtils.findAll(isRaceUrl, dom);
  return matchingAs.map(a => "https://www.german-racing.com" + a.attribs.href);
}

module.exports = {
  getRaceURLs
}