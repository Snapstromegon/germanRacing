const MONTHS = ["Jan.", "Feb.", "M&auml;r.", "Apr.", "Mai", "Jun.", "Jul.", "Aug.", "Sep.", "Okt.", "Nov.", "Dez."]

class Graph {
  constructor() {
    this.points = [];
    this.pointCollections = {};
  }

  addPoint(x, y, label, racename) {
    this.points.push({ x, y, label });
    this.pointCollections[x] = this.pointCollections[x] || {};
    this.pointCollections[x][y] = this.pointCollections[x][y] || [];
    this.pointCollections[x][y].push({label, racename});
  }

  render() {
    let xMin = Number.MAX_SAFE_INTEGER;
    let yMin = Number.MAX_SAFE_INTEGER;
    let xMax = -Number.MAX_SAFE_INTEGER;
    let yMax = -Number.MAX_SAFE_INTEGER;

    for (const point of this.points) {
      xMin = Math.min(xMin, point.x);
      yMin = Math.min(yMin, point.y);
      xMax = Math.max(xMax, point.x);
      yMax = Math.max(yMax, point.y);
    }

    let minDate = new Date();
    minDate.setTime(xMin);
    minDate.setDate(1);
    minDate.setHours(0);
    minDate.setMinutes(0);
    minDate.setSeconds(0);
    xMin = minDate.getTime();
    
    let maxDate = new Date();
    maxDate.setTime(xMax);
    maxDate.setMonth(maxDate.getMonth() + 1);
    maxDate.setDate(0);
    maxDate.setHours(0);
    maxDate.setMinutes(0);
    maxDate.setSeconds(0);
    xMax = maxDate.getTime();

    const getPointsHTML = () => {
      let ret = "";
      for (const point of this.points) {
        ret += `<div class="point" style="--x: ${point.x}; --y: ${point.y};"><div class="label">${point.label}</div></div>`;
      }
      return ret;
    }

    const getPointCollectionsHTML = () => {
      let ret = "";
      for (const x in this.pointCollections) {
        for (const y in this.pointCollections[x]) {
          ret += `<div class="point" style="--x: ${x}; --y: ${y}; --count: ${this.pointCollections[x][y].length};" title="${y}: ${this.pointCollections[x][y].length}">
            
          </div>`;
          /*<div class="label">${this.pointCollections[x][y][0].racename}
              ${this.pointCollections[x][y].map(horse => `<br/>${horse.label}`)}
            </div>*/
        }
      }
      return ret;
    }

    const getMarkerDistance = (range, idealLabelCount) => {
      const e = Math.log10(range);
      
      let stepsize = idealLabelCount;

      while (range / (stepsize * 10 ** e) < idealLabelCount / Math.SQRT2 || range / (stepsize * 10 ** e) > idealLabelCount * Math.SQRT2) {
        if (range / (stepsize * 10 ** e) < idealLabelCount / Math.SQRT2) {
          stepsize /= 2;
        } else {
          stepsize *= 2;
        }
      }

      return Math.floor(stepsize * 10 ** e);
    
    }

    const getXLabelsHTML = () => {
      const markerDistance = getMarkerDistance(xMax - xMin, 11);

      let text = "";
      let lines = "";

      for (let i = xMin; i < xMax; i += markerDistance) {
        const date = new Date();
        date.setTime(i);
        date.setDate(1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        text += `<div class="xLabel" style="--x:${i};">${MONTHS[date.getMonth()]} ${(date.getFullYear() + "").substr(2)}</div>`;
        lines += `<div class="xLine" style="--x:${i};"></div>`;
      }

      return {textLabels: text, lines: lines};
    }

    const getYLabelsHTML = () => {
      const markerDistance = getMarkerDistance(yMax, 6);

      let text = "";
      let lines = "";

      for (let i = markerDistance; i < yMax; i += markerDistance) {
        text += `<div class="yLabel" style="--y:${i};">${i}</div>`;
        lines += `<div class="yLine" style="--y:${i};"></div>`;
      }

      return {textLabels: text, lines: lines};
    }
    

    const yLabels = getYLabelsHTML();
    const xLabels = getXLabelsHTML();

    let html = `
      <div class="graphWrapper">
        <style>
          .graphWrapper {
            position: relative;
            display:grid;
            grid-template-columns: auto 1fr;
            grid-template-rows: 1fr auto;
            grid-template-areas: "yAchse graph" ". xAchse";
            height: 500px;
            --xMin: ${xMin};
            --yMin: ${yMin};
            --xMax: ${xMax};
            --yMax: ${yMax};
            padding: 1em;
            --graphPadding: 1em;
          }
          .xLabels {
            position: relative;
            grid-area: xAchse;
            border-top: 3px solid #000;
            height: 3rem;
          }
          .yLabels {
            position: relative;
            text-align: right;
            grid-area: yAchse;
            border-right: 3px solid #000;
            width: 3rem;
          }
          .graph {
            position: relative;
          }
          .xLabel {
            position: absolute;
            transform: translate(-50%, -50%);
            top: 50%;
            left: calc(var(--graphPadding) + (var(--x) - var(--xMin)) / (var(--xMax) - var(--xMin)) * (100% - 2 * var(--graphPadding)));
          }
          .xLine {
            position: absolute;
            left: calc(var(--graphPadding) + (var(--x) - var(--xMin)) / (var(--xMax) - var(--xMin)) * (100% - 2 * var(--graphPadding)));
            height: 100%;
            border-left: .1em dotted rgba(0,0,0,0.5);
            transform: translate(-50%);
          }
          .yLabel {
            position: absolute;
            width: 90%;
            left: 0;
            bottom: calc(var(--y) / var(--yMax) * 100%);
            transform: translateY(50%);
          }
          .yLine {
            position: absolute;
            bottom: calc(var(--y) / var(--yMax) * 100%);
            width: 100%;
            border-bottom: .1em dotted rgba(0,0,0,0.5);
            transform: translateY(50%);
          }
          .point {
            position: absolute;
            /*bottom: calc((var(--y) - var(--yMin)) / (var(--yMax) - var(--yMin)) * 100%);*/
            bottom: calc(var(--y) / var(--yMax) * 100%);
            left: calc(var(--graphPadding) + (var(--x) - var(--xMin)) / (var(--xMax) - var(--xMin)) * (100% - 2 * var(--graphPadding)));
            border-radius: 100%;
            display: block;
            width: calc(var(--count, 1) * var(--size));
            height: calc(var(--count, 1) * var(--size));
            background-color: #f00;
            background-color: rgb(calc(255 - (var(--y) - 2) * 255), calc((var(--y) - 2) * 10), 0);
            --size: 0.1em;
            transform: translate(-50%, 50%);
          }
          .point:hover{
            z-index: 2;
          }
          .point .label {
            display: inline-block;
            opacity: 0;
            background-color: #fff;
            padding: .5em;
            position: absolute;
            top: 50%;
            left: 100%;
            border-radius: .2em;
            border: .2em solid;
            border-color: rgb(calc(255 - (var(--y) - 2) * 255), calc((var(--y) - 2) * 25), 0);
            transform: translateY(-50%);
            pointer-events: none;
            width: 30ch;
          }
          .point:hover .label {
            opacity: 1;
          }
        </style>
        <div class="graph">${xLabels.lines}${yLabels.lines}${getPointCollectionsHTML()}</div>
        <div class="xLabels">${xLabels.textLabels}</div>
        <div class="yLabels">${yLabels.textLabels}</div>
      </div>
    `;

    return html;
  }
}

function create(data) {

  const graph = new Graph(name = "Gelaufene Pferde", xLabel = "Zeit", yLabel = "Alter");

  for (let race of data) {
    for (horse of race.horses) {
      graph.addPoint(new Date(race.date).getTime(), horse.age, `${horse.age}: ${horse.name}`, race.name);
    }
  }

  return graph.render();
}

module.exports = {
  create
}