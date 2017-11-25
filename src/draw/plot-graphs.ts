var scatterPlot = require('./scatter-plot');

export function plotGraphs(graphElem, topScoresElem, scatterPlotElem, lastState, scores, config) {
    lastState = lastState || {};
    var generationSize = scores.length;
    var graphcanvas = graphElem;
    var graphctx = graphcanvas.getContext('2d');
    var graphwidth = 400;
    var graphheight = 250;
    var nextState = cwStoreGraphScores(lastState, scores, generationSize);
    console.log(scores, nextState);
    cwClearGraphics(graphcanvas, graphctx, graphwidth, graphheight);
    cwPlotAverage(nextState, graphctx);
    cwPlotElite(nextState, graphctx);
    cwPlotTop(nextState, graphctx);
    cwListTopScores(topScoresElem, nextState);
    nextState.scatterGraph = drawAllResults(
        scatterPlotElem, config, nextState, lastState.scatterGraph,
    );
    return nextState;
}

function cwStoreGraphScores(lastState, cw_carScores, generationSize) {
    console.log(cw_carScores);
    return {
        cw_topScores: (lastState.cw_topScores || [])
            .concat([cw_carScores[0].score]),
        cw_graphAverage: (lastState.cw_graphAverage || []).concat([
            cwAverage(cw_carScores, generationSize),
        ]),
        cw_graphElite: (lastState.cw_graphElite || []).concat([
            cwEliteaverage(cw_carScores, generationSize),
        ]),
        cw_graphTop: (lastState.cw_graphTop || []).concat([
            cw_carScores[0].score.v,
        ]),
        allResults: (lastState.allResults || []).concat(cw_carScores),
    };
}

function cwPlotTop(state, graphctx) {
    var cw_graphTop = state.cw_graphTop;
    var graphsize = cw_graphTop.length;
    graphctx.strokeStyle = '#C83B3B';
    graphctx.beginPath();
    graphctx.moveTo(0, 0);
    for (var k = 0; k < graphsize; k++) {
        graphctx.lineTo(400 * (k + 1) / graphsize, cw_graphTop[k]);
    }
    graphctx.stroke();
}

function cwPlotElite(state, graphctx) {
    var cw_graphElite = state.cw_graphElite;
    var graphsize = cw_graphElite.length;
    graphctx.strokeStyle = '#7BC74D';
    graphctx.beginPath();
    graphctx.moveTo(0, 0);
    for (var k = 0; k < graphsize; k++) {
        graphctx.lineTo(400 * (k + 1) / graphsize, cw_graphElite[k]);
    }
    graphctx.stroke();
}

function cwPlotAverage(state, graphctx) {
    var cw_graphAverage = state.cw_graphAverage;
    var graphsize = cw_graphAverage.length;
    graphctx.strokeStyle = '#3F72AF';
    graphctx.beginPath();
    graphctx.moveTo(0, 0);
    for (var k = 0; k < graphsize; k++) {
        graphctx.lineTo(400 * (k + 1) / graphsize, cw_graphAverage[k]);
    }
    graphctx.stroke();
}

function cwEliteaverage(scores, generationSize) {
    var sum = 0;
    for (var k = 0; k < Math.floor(generationSize / 2); k++) {
        sum += scores[k].score.v;
    }
    return sum / Math.floor(generationSize / 2);
}

function cwAverage(scores, generationSize) {
    var sum = 0;
    for (var k = 0; k < generationSize; k++) {
        sum += scores[k].score.v;
    }
    return sum / generationSize;
}

function cwClearGraphics(graphcanvas, graphctx, graphwidth, graphheight) {
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

function cwListTopScores(elem, state) {
    var cw_topScores = state.cw_topScores;
    var ts = elem;
    ts.innerHTML = '<b>Top Scores:</b><br />';
    cw_topScores.sort(function (a, b) {
        if (a.v > b.v) {
            return -1;
        } else {
            return 1;
        }
    });

    for (var k = 0; k < Math.min(10, cw_topScores.length); k++) {
        var topScore = cw_topScores[k];
        // console.log(topScore);
        var n = '#' + (k + 1) + ':';
        var score = Math.round(topScore.v * 100) / 100;
        var distance = 'd:' + Math.round(topScore.x * 100) / 100;
        var yrange = 'h:' + Math.round(topScore.y2 * 100) / 100 + '/' + Math.round(topScore.y * 100) / 100 + 'm';
        var gen = '(Gen ' + cw_topScores[k].i + ')';

        ts.innerHTML += [n, score, distance, yrange, gen].join(' ') + '<br />';
    }
}

function drawAllResults(scatterPlotElem, config, allResults, previousGraph) {
    if (!scatterPlotElem) {
        return;
    }
    return scatterPlot(scatterPlotElem, allResults, config.propertyMap, previousGraph)
}
