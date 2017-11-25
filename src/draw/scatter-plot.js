/* globals vis Highcharts */

// Called when the Visualization API is loaded.

function highCharts(elem, scores) {
    let keys = Object.keys(scores[0].def);
    keys = keys.reduce((curArray, key) => {
        const l = scores[0].def[key].length;
        const subArray = [];
        for (let i = 0; i < l; i++) {
            subArray.push(`${key}.${i}`);
        }
        return curArray.concat(subArray);
    }, []);
    function retrieveValue(obj, path) {
        return path.split('.').reduce((curValue, key) => curValue[key], obj);
    }

    const dataObj = Object.keys(scores).reduce((kv, score) => {
        keys.forEach((key) => {
            kv[key].data.push([
                retrieveValue(score.def, key), score.score.v,
            ]);
        });
        return kv;
    }, keys.reduce((kv, key) => {
        kv[key] = {
            name: key,
            data: [],
        };
        return kv;
    }, {}));
    Highcharts.chart(elem.id, {
        chart: {
            type: 'scatter',
            zoomType: 'xy',
        },
        title: {
            text: 'Property Value to Score',
        },
        xAxis: {
            title: {
                enabled: true,
                text: 'Normalized',
            },
            startOnTick: true,
            endOnTick: true,
            showLastLabel: true,
        },
        yAxis: {
            title: {
                text: 'Score',
            },
        },
        legend: {
            layout: 'vertical',
            align: 'left',
            verticalAlign: 'top',
            x: 100,
            y: 70,
            floating: true,
            backgroundColor: (Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF',
            borderWidth: 1,
        },
        plotOptions: {
            scatter: {
                marker: {
                    radius: 5,
                    states: {
                        hover: {
                            enabled: true,
                            lineColor: 'rgb(100,100,100)',
                        },
                    },
                },
                states: {
                    hover: {
                        marker: {
                            enabled: false,
                        },
                    },
                },
                tooltip: {
                    headerFormat: '<b>{series.name}</b><br>',
                    pointFormat: '{point.x}, {point.y}',
                },
            },
        },
        series: keys.map(key => dataObj[key]),
    });
}

function visChart(elem, scores, propertyMap, graph) {
    // Create and populate a data table.
    const data = new vis.DataSet();
    scores.forEach((scoreInfo) => {
        data.add({
            x: getProperty(scoreInfo, propertyMap.x),
            y: getProperty(scoreInfo, propertyMap.x),
            z: getProperty(scoreInfo, propertyMap.z),
            style: getProperty(scoreInfo, propertyMap.z),
            // extra: def.ancestry
        });
    });

    function getProperty(info, key) {
        if (key === 'score') {
            return info.score.v;
        }
        return info.def[key];
    }

    // specify options
    const options = {
        width: '600px',
        height: '600px',
        style: 'dot-size',
        showPerspective: true,
        showLegend: true,
        showGrid: true,
        showShadow: false,

        // Option tooltip can be true, false, or a function returning a string with HTML contents
        tooltip(point) {
            // parameter point contains properties x, y, z, and data
            // data is the original object passed to the point constructor
            return `score: <b>${point.z}</b><br>`; // + point.data.extra;
        },

        // Tooltip default styling can be overridden
        tooltipStyle: {
            content: {
                background: 'rgba(255, 255, 255, 0.7)',
                padding: '10px',
                borderRadius: '10px',
            },
            line: {
                borderLeft: '1px dotted rgba(0, 0, 0, 0.5)',
            },
            dot: {
                border: '5px solid rgba(0, 0, 0, 0.5)',
            },
        },

        keepAspectRatio: true,
        verticalRatio: 0.5,
    };

    const camera = graph ? graph.getCameraPosition() : null;

    // create our graph
    const container = elem;
    graph = new vis.Graph3d(container, data, options);

    if (camera) graph.setCameraPosition(camera); // restore camera position
    return graph;
}

module.exports = highCharts;
