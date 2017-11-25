/* globals document confirm btoa */
/* globals b2Vec2 */
// Global Vars

const worldRun = require('./world/run.js');

const graphFns = require('./draw/plot-graphs.js');

const plotGraphs = graphFns.plotGraphs;


// ======= WORLD STATE ======

const $graphList = document.querySelector('#graph-list');
const $graphTemplate = document.querySelector('#graph-template');

function stringToHTML(s) {
    const temp = document.createElement('div');
    temp.innerHTML = s;
    return temp.children[0];
}

let states;
let runners;
let results;
const graphState = {};

function updateUI(key, scores) {
    const $graph = $graphList.querySelector(`#graph- + ${key}`);
    const $newGraph = stringToHTML($graphTemplate.innerHTML);
    $newGraph.id = `graph- + ${key}`;
    if ($graph) {
        $graphList.replaceChild($graph, $newGraph);
    } else {
        $graphList.appendChild($newGraph);
    }
    console.log($newGraph);
    const scatterPlotElem = $newGraph.querySelector('.scatterplot');
    scatterPlotElem.id = `graph- + ${key} + -scatter`;
    graphState[key] = plotGraphs(
        $newGraph.querySelector('.graphcanvas'),
        $newGraph.querySelector('.topscores'),
        scatterPlotElem,
        graphState[key],
        scores,
        {}
    );
}

const generationConfig = require('./generation-config');

const box2dfps = 60;
const max_car_health = box2dfps * 10;

const world_def = {
    gravity: new b2Vec2(0.0, -9.81),
    doSleep: true,
    floorseed: btoa(Math.seedrandom()),
    tileDimensions: new b2Vec2(1.5, 0.15),
    maxFloorTiles: 200,
    mutableFloor: false,
    box2dfps,
    motorSpeed: 20,
    maxCarHealth: max_car_health,
    schema: generationConfig.constants.schema,
};

const manageRound = {
    genetic: require('./machine-learning/genetic-algorithm/manage-round.js'),
    annealing: require('./machine-learning/simulated-annealing/manage-round.js'),
};

const createListeners = function (key) {
    return {
        preCarStep() {
        },
        carStep() {
        },
        carDeath(carInfo) {
            carInfo.score.i = states[key].counter;
        },
        generationEnd(results) {
            handleRoundEnd(key, results);
        },
    };
};

function generationZero() {
    const obj = Object.keys(manageRound).reduce((obj, key) => {
        obj.states[key] = manageRound[key].generationZero(generationConfig());
        obj.runners[key] = worldRun(world_def, obj.states[key].generation, createListeners(key));
        obj.results[key] = [];
        graphState[key] = {};
        return obj;
    }, { states: {}, runners: {}, results: {} });
    states = obj.states;
    runners = obj.runners;
    results = obj.results;
}

function handleRoundEnd(key, scores) {
    const previousCounter = states[key].counter;
    states[key] = manageRound[key].nextGeneration(states[key], scores, generationConfig());
    runners[key] = worldRun(world_def, states[key].generation, createListeners(key));
    if (states[key].counter === previousCounter) {
        console.log(results);
        results[key] = results[key].concat(scores);
    } else {
        handleGenerationEnd(key);
        results[key] = [];
    }
}

function runRound() {
    const toRun = new Map();
    Object.keys(states).forEach((key) => {
        toRun.set(key, states[key].counter);
    });
    console.log(toRun);
    while (toRun.size) {
        console.log('running');
        Array.from(toRun.keys()).forEach((key) => {
            if (states[key].counter === toRun.get(key)) {
                runners[key].step();
            } else {
                toRun.delete(key);
            }
        });
    }
}

function handleGenerationEnd(key) {
    const scores = results[key];
    scores.sort((a, b) => {
        if (a.score.v > b.score.v) {
            return -1;
        }
        return 1;
    });
    updateUI(key, scores);
    results[key] = [];
}

function cw_resetPopulationUI() {
    $graphList.innerHTML = '';
}

function cw_resetWorld() {
    cw_resetPopulationUI();
    Math.seedrandom();
    generationZero();
}

document.querySelector('#new-population').addEventListener('click', () => {
    cw_resetPopulationUI();
    generationZero();
});


document.querySelector('#confirm-reset').addEventListener('click', () => {
    cw_confirmResetWorld();
});

document.querySelector('#fast-forward').addEventListener('click', () => {
    runRound();
});

function cw_confirmResetWorld() {
    if (confirm('Really reset world?')) {
        cw_resetWorld();
    } else {
        return false;
    }
}

cw_resetWorld();
