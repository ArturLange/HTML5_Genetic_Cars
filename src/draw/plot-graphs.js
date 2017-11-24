const scatterPlot = require('./scatter-plot');

module.exports = {
  plotGraphs(graphElem, topScoresElem, scatterPlotElem, lastState, scores, config) {
    lastState = lastState || {};
    let generationSize = scores.length;
    let graphcanvas = graphElem;
    let graphctx = graphcanvas.getContext('2d');
    let graphwidth = 400;
    let graphheight = 250;
    let nextState = cw_storeGraphScores(lastState, scores, generationSize,
    );
    console.log(scores, nextState);
    cw_clearGraphics(graphcanvas, graphctx, graphwidth, graphheight);
    cw_plotAverage(nextState, graphctx);
    cw_plotElite(nextState, graphctx);
    cw_plotTop(nextState, graphctx);
    cw_listTopScores(topScoresElem, nextState);
    nextState.scatterGraph = drawAllResults(scatterPlotElem, config, nextState, lastState.scatterGraph,
    );
    return nextState;
  },
};


function cw_storeGraphScores(lastState, cw_carScores, generationSize) {
  console.log(cw_carScores);
  return {
    cw_topScores: (lastState.cw_topScores || [])
      .concat([cw_carScores[0].score]),
    cw_graphAverage: (lastState.cw_graphAverage || []).concat([
      cw_average(cw_carScores, generationSize),
    ]),
    cw_graphElite: (lastState.cw_graphElite || []).concat([
      cw_eliteaverage(cw_carScores, generationSize),
    ]),
    cw_graphTop: (lastState.cw_graphTop || []).concat([
      cw_carScores[0].score.v,
    ]),
    allResults: (lastState.allResults || []).concat(cw_carScores),
  };
}

function cw_plotTop(state, graphctx) {
  const cw_graphTop = state.cw_graphTop;
  const graphsize = cw_graphTop.length;
  graphctx.strokeStyle = '#C83B3B';
  graphctx.beginPath();
  graphctx.moveTo(0, 0);
  for (let k = 0; k < graphsize; k++) {
    graphctx.lineTo(400 * (k + 1) / graphsize, cw_graphTop[k]);
  }
  graphctx.stroke();
}

function cw_plotElite(state, graphctx) {
  const cw_graphElite = state.cw_graphElite;
  const graphsize = cw_graphElite.length;
  graphctx.strokeStyle = '#7BC74D';
  graphctx.beginPath();
  graphctx.moveTo(0, 0);
  for (let k = 0; k < graphsize; k++) {
    graphctx.lineTo(400 * (k + 1) / graphsize, cw_graphElite[k]);
  }
  graphctx.stroke();
}

function cw_plotAverage(state, graphctx) {
  const cw_graphAverage = state.cw_graphAverage;
  const graphsize = cw_graphAverage.length;
  graphctx.strokeStyle = '#3F72AF';
  graphctx.beginPath();
  graphctx.moveTo(0, 0);
  for (let k = 0; k < graphsize; k++) {
    graphctx.lineTo(400 * (k + 1) / graphsize, cw_graphAverage[k]);
  }
  graphctx.stroke();
}


function cw_eliteaverage(scores, generationSize) {
  let sum = 0;
  for (let k = 0; k < Math.floor(generationSize / 2); k++) {
    sum += scores[k].score.v;
  }
  return sum / Math.floor(generationSize / 2);
}

function cw_average(scores, generationSize) {
  let sum = 0;
  for (let k = 0; k < generationSize; k++) {
    sum += scores[k].score.v;
  }
  return sum / generationSize;
}

function cw_clearGraphics(graphcanvas, graphctx, graphwidth, graphheight) {
  graphcanvas.width = graphcanvas.width;
  graphctx.translate(0, graphheight);
  graphctx.scale(1, -1);
  graphctx.lineWidth = 1;
  graphctx.strokeStyle = '#3F72AF';
  graphctx.beginPath();
  graphctx.moveTo(0, graphheight / 2);
  graphctx.lineTo(graphwidth, graphheight / 2);
  graphctx.moveTo(0, graphheight / 4);
  graphctx.lineTo(graphwidth, graphheight / 4);
  graphctx.moveTo(0, graphheight * 3 / 4);
  graphctx.lineTo(graphwidth, graphheight * 3 / 4);
  graphctx.stroke();
}

function cw_listTopScores(elem, state) {
  const cw_topScores = state.cw_topScores;
  const ts = elem;
  ts.innerHTML = '<b>Top Scores:</b><br />';
  cw_topScores.sort((a, b) => {
    if (a.v > b.v) {
      return -1
    } 
      return 1
    
  });

  for (let k = 0; k < Math.min(10, cw_topScores.length); k++) {
    const topScore = cw_topScores[k];
    // console.log(topScore);
    const n = `#${  k + 1  }:`;
    const score = Math.round(topScore.v * 100) / 100;
    const distance = `d:${  Math.round(topScore.x * 100) / 100}`;
    const yrange = 'h:' + Math.round(topScore.y2 * 100) / 100 + '/' + Math.round(topScore.y * 100) / 100 + 'm';
    const gen = `(Gen ${  cw_topScores[k].i  })`

    ts.innerHTML += `${[n, score, distance, yrange, gen].join(' ')  }<br />`;
  }
}

function drawAllResults(scatterPlotElem, config, allResults, previousGraph) {
  if (!scatterPlotElem) return;
  return scatterPlot(scatterPlotElem, allResults, config.propertyMap, previousGraph);
}
