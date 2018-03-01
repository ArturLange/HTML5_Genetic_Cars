/* globals document performance localStorage alert confirm btoa HTMLDivElement */
/* globals B2Vec2 */
// Global Vars

import carConstruct = require('./car-schema/construct');

import { drawCar } from './draw/draw-car';
import graph_fns = require('./draw/plot-graphs');

import * as seedrandom from 'seedrandom';

const plotGraphs = graph_fns.plotGraphs;
const cwClearGraphics = graph_fns.clearGraphics;
import { runDefs } from './world/run';
import { drawFloor } from './draw/draw-floor';
import { generationZero, nextGeneration } from './machine-learning/genetic-algorithm/manage-round';
import {
    B2Vec2,
} from '../lib/box2d-wrapper';

import { Car as cw_Car } from './draw/car';
import {
    ghost_get_position, ghost_draw_frame, ghost_move_frame,
    ghost_compare_to_replay, ghost_add_replay_frame, ghost_reset_ghost, ghost_create_ghost,
    ghost_create_replay,
} from './ghost';
let ghost;
const carMap = new Map();

const doDraw = true;
const cwPaused = false;

const box2dfps = 60;
const screenfps = 60;

const canvas = <HTMLCanvasElement>document.getElementById('mainbox');
const ctx = canvas.getContext('2d');

const camera = {
    speed: 0.05,
    pos: {
        x: 0, y: 0,
    },
    target: -1,
    zoom: 70,
};

const minimapcamera = document.getElementById('minimapcamera').style;
const minimapholder = document.querySelector('#minimapholder');

const minimapcanvas = document.getElementById('minimap');
const minimapctx = minimapcanvas.getContext('2d');
const minimapscale = 3;
const minimapfogdistance = 0;
const fogdistance = document.getElementById('minimapfog').style;

const carConstants = carConstruct.carConstants();

const maxCarHealth = box2dfps * 10;

const cwGhostReplayInterval = null;

const distanceMeter = document.getElementById('distancemeter');
const heightMeter = document.getElementById('heightmeter');

let leaderPosition = {
    x: 0, y: 0,
};

minimapcamera.width = 12 * minimapscale + 'px';
minimapcamera.height = 6 * minimapscale + 'px';

// ======= WORLD STATE ======
const generationConfig = require('./generation-config');

const world_def = {
    gravity: new B2Vec2(0.0, -9.81),
    doSleep: true,
    floorseed: btoa(seedrandom()),
    tileDimensions: new B2Vec2(1.5, 0.15),
    maxFloorTiles: 200,
    mutable_floor: false,
    box2dfps: box2dfps,
    motorSpeed: 20,
    max_car_health: maxCarHealth,
    schema: generationConfig.constants.schema,
};

var cw_deadCars;
var graphState = {
    cw_topScores: [],
    cw_graphAverage: [],
    cw_graphElite: [],
    cw_graphTop: [],
};

function resetGraphState() {
    graphState = {
        cw_topScores: [],
        cw_graphAverage: [],
        cw_graphElite: [],
        cw_graphTop: [],
    };
}

// ==========================

var generationState;

// ======== Activity State ====
var cw_runningInterval;
var cw_drawInterval;
var currentRunner;

function showDistance(distance, height) {
    distanceMeter.innerHTML = distance + ' meters<br />';
    heightMeter.innerHTML = height + ' meters';
    if (distance > minimapfogdistance) {
        fogdistance.width = 800 - Math.round(distance + 15) * minimapscale + 'px';
        minimapfogdistance = distance;
    }
}

/* === END Car ============================================================= */
/* ========================================================================= */

/* ========================================================================= */

/* ==== Generation ========================================================= */

function cw_generationZero() {

    generationState = generationZero(generationConfig());
}

function resetCarUI() {
    cw_deadCars = 0;
    leaderPosition = {
        x: 0, y: 0,
    };
    document.getElementById('generation').innerHTML = generationState.counter.toString();
    document.getElementById('cars').innerHTML = '';
    document.getElementById('population').innerHTML = generationConfig.constants.generationSize.toString();
}

/* ==== END Genration ====================================================== */
/* ========================================================================= */

/* ========================================================================= */

/* ==== Drawing ============================================================ */

function cw_drawScreen() {
    var floorTiles = currentRunner.scene.floorTiles;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    cw_setCameraPosition();
    var camera_x = camera.pos.x;
    var camera_y = camera.pos.y;
    var zoom = camera.zoom;
    ctx.translate(200 - (camera_x * zoom), 200 + (camera_y * zoom));
    ctx.scale(zoom, -zoom);
    drawFloor(ctx, camera, floorTiles);
    ghost_draw_frame(ctx, ghost, camera);
    cw_drawCars();
    ctx.restore();
}

function cw_minimapCamera(/* x, y*/) {
    var camera_x = camera.pos.x;
    var camera_y = camera.pos.y;
    minimapcamera.left = Math.round((2 + camera_x) * minimapscale) + 'px';
    minimapcamera.top = Math.round((31 - camera_y) * minimapscale) + 'px';
}

function cw_setCameraTarget(k) {
    camera.target = k;
}

function cw_setCameraPosition() {
    var cameraTargetPosition;
    if (camera.target !== -1) {
        cameraTargetPosition = carMap.get(camera.target).getPosition();
    } else {
        cameraTargetPosition = leaderPosition;
    }
    var diff_y = camera.pos.y - cameraTargetPosition.y;
    var diff_x = camera.pos.x - cameraTargetPosition.x;
    camera.pos.y -= camera.speed * diff_y;
    camera.pos.x -= camera.speed * diff_x;
    cw_minimapCamera(camera.pos.x, camera.pos.y);
}

function cw_drawGhostReplay() {
    var floorTiles = currentRunner.scene.floorTiles;
    var carPosition = ghost_get_position(ghost);
    camera.pos.x = carPosition.x;
    camera.pos.y = carPosition.y;
    cw_minimapCamera(camera.pos.x, camera.pos.y);
    showDistance(
        Math.round(carPosition.x * 100) / 100,
        Math.round(carPosition.y * 100) / 100,
    );
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(
        200 - (carPosition.x * camera.zoom),
        200 + (carPosition.y * camera.zoom),
    );
    ctx.scale(camera.zoom, -camera.zoom);
    ghost_draw_frame(ctx, ghost);
    ghost_move_frame(ghost);
    drawFloor(ctx, camera, floorTiles);
    ctx.restore();
}

function cw_drawCars() {
    var cw_carArray = Array.from(carMap.values());
    for (var k = (cw_carArray.length - 1); k >= 0; k--) {
        var myCar = cw_carArray[k];
        drawCar(carConstants, myCar, camera, ctx);
    }
}

function toggleDisplay() {
    if (cwPaused) {
        return;
    }
    canvas.width = canvas.width;
    if (doDraw) {
        doDraw = false;
        cw_stopSimulation();
        cw_runningInterval = setInterval(function () {
            var time = performance.now() + (1000 / screenfps);
            while (time > performance.now()) {
                simulationStep();
            }
        }, 1);
    } else {
        doDraw = true;
        clearInterval(cw_runningInterval);
        cw_startSimulation();
    }
}

function cw_drawMiniMap() {
    var floorTiles = currentRunner.scene.floorTiles;
    var last_tile = null;
    var tile_position = new B2Vec2(-5, 0);
    minimapfogdistance = 0;
    fogdistance.width = '800px';
    minimapcanvas.width = minimapcanvas.width;
    minimapctx.strokeStyle = '#3F72AF';
    minimapctx.beginPath();
    minimapctx.moveTo(0, 35 * minimapscale);
    for (var k = 0; k < floorTiles.length; k++) {
        last_tile = floorTiles[k];
        var last_fixture = last_tile.GetFixtureList();
        var last_world_coords = last_tile.GetWorldPoint(last_fixture.GetShape().m_vertices[3]);
        tile_position = last_world_coords;
        minimapctx.lineTo((tile_position.x + 5) * minimapscale, (-tile_position.y + 35) * minimapscale);
    }
    minimapctx.stroke();
}

/* ==== END Drawing ======================================================== */
/* ========================================================================= */
const uiListeners = {
    preCarStep: function () {
        ghost_move_frame(ghost);
    },
    carStep(car) {
        updateCarUI(car);
    },
    carDeath(carInfo) {

        const k = carInfo.index;

        var car = carInfo.car, score = carInfo.score;
        carMap.get(carInfo).kill(currentRunner, world_def);

        // refocus camera to leader on death
        if (camera.target == carInfo) {
            cw_setCameraTarget(-1);
        }
        // console.log(score);
        carMap.delete(carInfo);
        ghost_compare_to_replay(car.replay, ghost, score.v);
        score.i = generationState.counter;

        cw_deadCars += 1;
        const generationSize = generationConfig.constants.generationSize;
        document.getElementById('population').innerHTML = (generationSize - cw_deadCars).toString();

        // console.log(leaderPosition.leader, k)
        if (leaderPosition.leader == k) {
            // leader is dead, find new leader
            cw_findLeader();
        }
    },
    generationEnd(results) {
        cleanupRound(results);
        return cw_newRound(results);
    },
};

function simulationStep() {
    currentRunner.step();
    showDistance(
        Math.round(leaderPosition.x * 100) / 100,
        Math.round(leaderPosition.y * 100) / 100,
    );
}

function updateCarUI(carInfo) {
    var k = carInfo.index;
    var car = carMap.get(carInfo);
    var position = car.getPosition();

    ghost_add_replay_frame(car.replay, car.car.car);
    car.minimapmarker.style.left = Math.round((position.x + 5) * minimapscale) + 'px';
    car.healthBar.width = Math.round((car.car.state.health / maxCarHealth) * 100) + '%';
    if (position.x > leaderPosition.x) {
        leaderPosition = position;
        leaderPosition.leader = k;
        // console.log("new leader: ", k);
    }
}

function cw_findLeader() {
    var lead = 0;
    var cw_carArray = Array.from(carMap.values());
    for (var k = 0; k < cw_carArray.length; k++) {
        if (!cw_carArray[k].alive) {
            continue;
        }
        var position = cw_carArray[k].getPosition();
        if (position.x > lead) {
            leaderPosition = position;
            leaderPosition.leader = k;
        }
    }
}

function fastForward() {
    var gen = generationState.counter;
    while (gen === generationState.counter) {
        currentRunner.step();
    }
}

function cleanupRound(results) {

    results.sort(function (a, b) {
        if (a.score.v > b.score.v) {
            return -1;
        } else {
            return 1;
        }
    });
    graphState = plotGraphs(
        document.getElementById('graphcanvas'),
        document.getElementById('topscores'),
        null,
        graphState,
        results,
    );
}

function cw_newRound(results) {
    camera.pos.x = camera.pos.y = 0;
    cw_setCameraTarget(-1);

    generationState = nextGeneration(
        generationState, results, generationConfig(),
    );
    if (world_def.mutable_floor) {
        // GHOST DISABLED
        ghost = null;
        world_def.floorseed = btoa(seedrandom());
    } else {
        // RE-ENABLE GHOST
        ghost_reset_ghost(ghost);
    }
    currentRunner = runDefs(world_def, generationState.generation, uiListeners);
    setupCarUI();
    cw_drawMiniMap();
    resetCarUI();
}

function cw_startSimulation() {
    cw_runningInterval = setInterval(simulationStep, Math.round(1000 / box2dfps));
    cw_drawInterval = setInterval(cw_drawScreen, Math.round(1000 / screenfps));
}

function cw_stopSimulation() {
    clearInterval(cw_runningInterval);
    clearInterval(cw_drawInterval);
}

function cw_resetPopulationUI() {
    document.getElementById('generation').innerHTML = '';
    document.getElementById('cars').innerHTML = '';
    document.getElementById('topscores').innerHTML = '';
    cwClearGraphics();
    resetGraphState();
}

function cw_resetWorld() {
    doDraw = true;
    cw_stopSimulation();
    world_def.floorseed = document.getElementById('newseed').value;
    cw_resetPopulationUI();

    seedrandom();
    cw_generationZero();
    currentRunner = runDefs(
        world_def, generationState.generation, uiListeners,
    );

    ghost = ghost_create_ghost();
    resetCarUI();
    setupCarUI();
    cw_drawMiniMap();

    cw_startSimulation();
}

function setupCarUI() {
    currentRunner.cars.map((carInfo) => {
        var car = new cw_Car(carInfo, carMap);
        carMap.set(carInfo, car);
        car.replay = ghost_create_replay();
        ghost_add_replay_frame(car.replay, car.car.car);
    });
}

document.querySelector('#fast-forward').addEventListener('click', () => {
    fastForward();
});

document.querySelector('#save-progress').addEventListener('click', () => {
    saveProgress();
});

document.querySelector('#restore-progress').addEventListener('click', () => {
    restoreProgress();
});

document.querySelector('#toggle-display').addEventListener('click', () => {
    toggleDisplay();
});

document.querySelector('#new-population').addEventListener('click', () => {
    cw_resetPopulationUI();
    cw_generationZero();
    ghost = ghost_create_ghost();
    resetCarUI();
});

function saveProgress() {
    localStorage.cw_savedGeneration = JSON.stringify(generationState.generation);
    localStorage.cw_genCounter = generationState.counter;
    localStorage.cw_ghost = JSON.stringify(ghost);
    localStorage.cw_topScores = JSON.stringify(graphState.cw_topScores);
    localStorage.cw_floorSeed = world_def.floorseed;
}

function restoreProgress() {
    if (typeof localStorage.cw_savedGeneration == 'undefined' || localStorage.cw_savedGeneration == null) {
        alert('No saved progress found');
        return;
    }
    cw_stopSimulation();
    generationState.generation = JSON.parse(localStorage.cw_savedGeneration);
    generationState.counter = localStorage.cw_genCounter;
    ghost = JSON.parse(localStorage.cw_ghost);
    graphState.cw_topScores = JSON.parse(localStorage.cw_topScores);
    world_def.floorseed = localStorage.cw_floorSeed;
    document.getElementById('newseed').value = world_def.floorseed;

    currentRunner = runDefs(world_def, generationState.generation, uiListeners);
    cw_drawMiniMap();
    seedrandom();

    resetCarUI();
    cw_startSimulation();
}

document.querySelector('#confirm-reset').addEventListener('click', () => {
    cw_confirmResetWorld();
});

function cw_confirmResetWorld() {
    if (confirm('Really reset world?')) {
        cw_resetWorld();
    } else {
        return false;
    }
}

// ghost replay stuff

function cw_pauseSimulation() {
    cwPaused = true;
    clearInterval(cw_runningInterval);
    clearInterval(cw_drawInterval);
    ghost_pause(ghost);
}

function cw_resumeSimulation() {
    cwPaused = false;
    ghost_resume(ghost);
    cw_runningInterval = setInterval(simulationStep, Math.round(1000 / box2dfps));
    cw_drawInterval = setInterval(cw_drawScreen, Math.round(1000 / screenfps));
}

function cw_startGhostReplay() {
    if (!doDraw) {
        toggleDisplay();
    }
    cw_pauseSimulation();
    cwGhostReplayInterval = setInterval(cw_drawGhostReplay, Math.round(1000 / screenfps));
}

function cw_stopGhostReplay() {
    clearInterval(cwGhostReplayInterval);
    cwGhostReplayInterval = null;
    cw_findLeader();
    camera.pos.x = leaderPosition.x;
    camera.pos.y = leaderPosition.y;
    cw_resumeSimulation();
}

document.querySelector('#toggle-ghost').addEventListener('click', (e) => {
    cw_toggleGhostReplay(e.target);
});

function cw_toggleGhostReplay(button) {
    if (cwGhostReplayInterval == null) {
        cw_startGhostReplay();
        button.value = 'Resume simulation';
    } else {
        cw_stopGhostReplay();
        button.value = 'View top replay';
    }
}

// ghost replay stuff END

// initial stuff, only called once (hopefully)
function cw_init() {
    // clone silver dot and health bar
    var mmm = document.getElementsByName('minimapmarker')[0];
    var hbar = document.getElementsByName('healthbar')[0];
    var generationSize = generationConfig.constants.generationSize;

    for (var k = 0; k < generationSize; k++) {

        // minimap markers
        var newbar = mmm.cloneNode(true);
        newbar.id = 'bar' + k;
        newbar.style.paddingTop = k * 9 + 'px';
        minimapholder.appendChild(newbar);

        // health bars
        var newhealth = hbar.cloneNode(true);
        newhealth.getElementsByTagName('DIV')[0].id = 'health' + k;
        newhealth.car_index = k;
        document.getElementById('health').appendChild(newhealth);
    }
    mmm.parentNode.removeChild(mmm);
    hbar.parentNode.removeChild(hbar);
    world_def.floorseed = btoa(seedrandom());
    cw_generationZero();
    ghost = ghost_create_ghost();
    resetCarUI();
    currentRunner = runDefs(world_def, generationState.generation, uiListeners);
    setupCarUI();
    cw_drawMiniMap();
    cw_runningInterval = setInterval(simulationStep, Math.round(1000 / box2dfps));
    cw_drawInterval = setInterval(cw_drawScreen, Math.round(1000 / screenfps));
}

function relMouseCoords(event) {
    var totalOffsetX = 0;
    var totalOffsetY = 0;
    var canvasX = 0;
    var canvasY = 0;
    var currentElement = this;

    do {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
        currentElement = currentElement.offsetParent;
    }
    while (currentElement);

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return {x: canvasX, y: canvasY};
}

HTMLDivElement.prototype.relMouseCoords = relMouseCoords;
minimapholder.onclick = function (event) {
    var coords = minimapholder.relMouseCoords(event);
    var cw_carArray = Array.from(carMap.values());
    var closest = {
        value: cw_carArray[0].car,
        dist: Math.abs(((cw_carArray[0].getPosition().x + 6) * minimapscale) - coords.x),
        x: cw_carArray[0].getPosition().x,
    };

    var maxX = 0;
    for (var i = 0; i < cw_carArray.length; i++) {
        var pos = cw_carArray[i].getPosition();
        var dist = Math.abs(((pos.x + 6) * minimapscale) - coords.x);
        if (dist < closest.dist) {
            closest.value = cw_carArray.car;
            closest.dist = dist;
            closest.x = pos.x;
        }
        maxX = Math.max(pos.x, maxX);
    }

    if (closest.x === maxX) { // focus on leader again
        cw_setCameraTarget(-1);
    } else {
        cw_setCameraTarget(closest.value);
    }
};

document.querySelector('#mutationrate').addEventListener('change', (e) => {
    const elem = <HTMLSelectElement>e.target;
    cw_setMutation(elem.options[elem.selectedIndex].value);
});

document.querySelector('#mutationsize').addEventListener('change', (e) => {
    const elem = <HTMLSelectElement>e.target;
    cwSetMutationRange(elem.options[elem.selectedIndex].value);
});

document.querySelector('#floor').addEventListener('change', (e) => {
    const elem = <HTMLSelectElement>e.target;
    cwSetMutableFloor(elem.options[elem.selectedIndex].value);
});

document.querySelector('#gravity').addEventListener('change', (e) => {
    const elem = <HTMLSelectElement>e.target;
    cwSetGravity(elem.options[elem.selectedIndex].value);
});

document.querySelector('#elitesize').addEventListener('change', (e) => {
    const elem = <HTMLSelectElement>e.target;
    cwSetEliteSize(elem.options[elem.selectedIndex].value);
});

function cw_setMutation(mutation) {
    generationConfig.constants.gen_mutation = parseFloat(mutation);
}

function cwSetMutationRange(range) {
    generationConfig.constants.mutation_range = parseFloat(range);
}

function cwSetMutableFloor(choice) {
    world_def.mutable_floor = (choice === 1);
}

function cwSetGravity(choice) {
    world_def.gravity = new B2Vec2(0.0, -parseFloat(choice));
    var world = currentRunner.scene.world;
    // CHECK GRAVITY CHANGES
    if (world.GetGravity().y != world_def.gravity.y) {
        world.SetGravity(world_def.gravity);
    }
}

function cwSetEliteSize(clones) {
    generationConfig.constants.championLength = parseInt(clones, 10);
}

cw_init();
