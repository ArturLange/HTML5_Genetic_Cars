/* globals document confirm btoa */
/* globals B2Vec2 */
// Global Vars
import { runDefs } from './world/run';
import { plotGraphs } from './draw/plot-graphs';
import * as generationConfig from './generation-config';
import {
    B2Vec2,
} from '../lib/box2d-wrapper';

import * as seedrandom from 'seedrandom';

// ======= WORLD STATE ======

const $graphList = document.querySelector('#graph-list');
const $graphTemplate = document.querySelector('#graph-template');

function stringToHTML(s) {
    var temp = document.createElement('div');
    temp.innerHTML = s;
    return temp.children[0];
}

let states;
let runners;
let results;
let graphState = {};

function updateUI(key, scores) {
    var $graph = $graphList.querySelector('#graph-' + key);
    var $newGraph = stringToHTML($graphTemplate.innerHTML);
    $newGraph.id = 'graph-' + key;
    if ($graph) {
        $graphList.replaceChild($graph, $newGraph);
    } else {
        $graphList.appendChild($newGraph);
    }
    console.log($newGraph);
    var scatterPlotElem = $newGraph.querySelector('.scatterplot');
    scatterPlotElem.id = 'graph-' + key + '-scatter';
    graphState[key] = plotGraphs(
        $newGraph.querySelector('.graphcanvas'),
        $newGraph.querySelector('.topscores'),
        scatterPlotElem,
        graphState[key],
        scores,
        {},
    );
}

const box2dfps = 60;
const max_car_health = box2dfps * 10;

const world_def = {
    gravity: new B2Vec2(0.0, -9.81),
    doSleep: true,
    floorseed: btoa(seedrandom()),
    tileDimensions: new B2Vec2(1.5, 0.15),
    maxFloorTiles: 200,
    mutable_floor: false,
    box2dfps: box2dfps,
    motorSpeed: 20,
    max_car_health: max_car_health,
    schema: generationConfig.constants.schema,
};

var manageRound = {
    genetic: require('./machine-learning/genetic-algorithm/manage-round'),
    annealing: require('./machine-learning/simulated-annealing/manage-round'),
};

const createListeners = function (key) {
    return {
        preCarStep: function () {},
        carStep: function () {},
        carDeath: function (carInfo) {
            carInfo.score.i = states[key].counter;
        },
        generationEnd: function (results) {
            handleRoundEnd(key, results);
        },
    };
};

function generationZero() {
    var obj = Object.keys(manageRound).reduce(function (obj, key) {
        obj.states[key] = manageRound[key].generationZero(generationConfig());
        obj.runners[key] = runDefs(
            world_def, obj.states[key].generation, createListeners(key),
        );
        obj.results[key] = [];
        graphState[key] = {};
        return obj;
    }, {states: {}, runners: {}, results: {}});
    states = obj.states;
    runners = obj.runners;
    results = obj.results;
}

function handleRoundEnd(key, scores) {
    var previousCounter = states[key].counter;
    states[key] = manageRound[key].nextGeneration(
        states[key], scores, generationConfig(),
    );
    runners[key] = runDefs(
        world_def, states[key].generation, createListeners(key),
    );
    if (states[key].counter === previousCounter) {
        console.log(results);
        results[key] = results[key].concat(scores);
    } else {
        handleGenerationEnd(key);
        results[key] = [];
    }
}

function runRound() {
    var toRun = new Map();
    Object.keys(states).forEach(function (key) { toRun.set(key, states[key].counter); });
    console.log(toRun);
    while (toRun.size) {
        console.log('running');
        Array.from(toRun.keys()).forEach(function (key) {
            if (states[key].counter === toRun.get(key)) {
                runners[key].step();
            } else {
                toRun.delete(key);
            }
        });
    }
}

function handleGenerationEnd(key) {
    var scores = results[key];
    scores.sort(function (a, b) {
        if (a.score.v > b.score.v) {
            return -1;
        } else {
            return 1;
        }
    });
    updateUI(key, scores);
    results[key] = [];
}

function cw_resetPopulationUI() {
    $graphList.innerHTML = '';
}

function cw_resetWorld() {
    cw_resetPopulationUI();
    seedrandom();
    generationZero();
}

document.querySelector('#new-population').addEventListener('click', function () {
    cw_resetPopulationUI();
    generationZero();
});

document.querySelector('#confirm-reset').addEventListener('click', function () {
    cw_confirmResetWorld();
});

document.querySelector('#fast-forward').addEventListener('click', function () {
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
