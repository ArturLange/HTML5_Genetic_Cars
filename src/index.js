/* globals document performance localStorage alert confirm btoa HTMLDivElement */
/* globals b2Vec2 */
// Global Vars

const worldRun = require('./world/run.js');
const carConstruct = require('./car-schema/construct.js');

const manageRound = require('./machine-learning/genetic-algorithm/manage-round.js');

const ghostFns = require('./ghost/index.js');

const drawCar = require('./draw/draw-car.js');
const graphFns = require('./draw/plot-graphs.js');

const plotGraphs = graphFns.plotGraphs;
const cwClearGraphics = graphFns.clearGraphics;
const cwDrawFloor = require('./draw/draw-floor.js');

const ghostDrawFrame = ghostFns.ghostDrawFrame;
const ghostCreateGhost = ghostFns.ghostCreateGhost;
const ghostAddReplayFrame = ghostFns.ghostAddReplayFrame;
const ghostCompareToReplay = ghostFns.ghostCompareToReplay;
const ghostGetPosition = ghostFns.ghostGetPosition;
const ghostMoveFrame = ghostFns.ghostMoveFrame;
const ghostResetGhost = ghostFns.ghostResetGhost;
const ghostPause = ghostFns.ghostPause;
const ghostResume = ghostFns.ghostResume;
const ghostCreateReplay = ghostFns.ghostCreateReplay;

const cwCar = require('./draw/draw-car-stats.js');

let ghost;
const carMap = new Map();

let doDraw = true;
let cwPaused = false;

const box2dfps = 60;
const screenfps = 60;

const canvas = document.getElementById('mainbox');
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
let minimapfogdistance = 0;
const fogdistance = document.getElementById('minimapfog').style;


const carConstants = carConstruct.carConstants();


const maxCarHealth = box2dfps * 10;

let cwGhostReplayInterval = null;

const distanceMeter = document.getElementById('distancemeter');
const heightMeter = document.getElementById('heightmeter');

let leaderPosition = {
    x: 0, y: 0,
};

minimapcamera.width = `${12 * minimapscale}px`;
minimapcamera.height = `${6 * minimapscale}px`;


// ======= WORLD STATE ======
const generationConfig = require('./generation-config');


const worldDef = {
    gravity: new b2Vec2(0.0, -9.81),
    doSleep: true,
    floorseed: btoa(Math.seedrandom()),
    tileDimensions: new b2Vec2(1.5, 0.15),
    maxFloorTiles: 200,
    mutableFloor: false,
    box2dfps,
    motorSpeed: 20,
    maxCarHealth,
    schema: generationConfig.constants.schema,
};

let cwDeadCars;
let graphState = {
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

let generationState;

// ======== Activity State ====
let cwRunningInterval;
let cwDrawInterval;
let currentRunner;

function showDistance(distance, height) {
    distanceMeter.innerHTML = `${distance} meters<br />`;
    heightMeter.innerHTML = `${height} meters`;
    if (distance > minimapfogdistance) {
        fogdistance.width = `${800 - (Math.round(distance + 15) * minimapscale)}px`;
        minimapfogdistance = distance;
    }
}


/* === END Car ============================================================= */
/* ========================================================================= */


/* ========================================================================= */

/* ==== Generation ========================================================= */

function cwGenerationZero() {
    generationState = manageRound.generationZero(generationConfig());
}

function resetCarUI() {
    cwDeadCars = 0;
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

function cwMinimapCamera(/* x, y */) {
    minimapcamera.left = `${Math.round((2 + camera.pos.x) * minimapscale)}px`;
    minimapcamera.top = `${Math.round((31 - camera.pos.y) * minimapscale)}px`;
}

function cwSetCameraTarget(k) {
    camera.target = k;
}

function cwSetCameraPosition() {
    let cameraTargetPosition;
    if (camera.target !== -1) {
        cameraTargetPosition = carMap.get(camera.target).getPosition();
    } else {
        cameraTargetPosition = leaderPosition;
    }
    const diffY = camera.pos.y - cameraTargetPosition.y;
    const diffX = camera.pos.x - cameraTargetPosition.x;
    camera.pos.y -= camera.speed * diffY;
    camera.pos.x -= camera.speed * diffX;
    cwMinimapCamera(camera.pos.x, camera.pos.y);
}

function cwDrawGhostReplay() {
    const floorTiles = currentRunner.scene.floorTiles;
    const carPosition = ghostGetPosition(ghost);
    camera.pos.x = carPosition.x;
    camera.pos.y = carPosition.y;
    cwMinimapCamera(camera.pos.x, camera.pos.y);
    showDistance(
        Math.round(carPosition.x * 100) / 100,
        Math.round(carPosition.y * 100) / 100
    );
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(
        200 - (carPosition.x * camera.zoom),
        200 + (carPosition.y * camera.zoom)
    );
    ctx.scale(camera.zoom, -camera.zoom);
    ghostDrawFrame(ctx, ghost);
    ghostMoveFrame(ghost);
    cwDrawFloor(ctx, camera, floorTiles);
    ctx.restore();
}


function cwDrawCars() {
    const cwCarArray = Array.from(carMap.values());
    for (let k = (cwCarArray.length - 1); k >= 0; k--) {
        const myCar = cwCarArray[k];
        drawCar(carConstants, myCar, camera, ctx);
    }
}

function cwDrawScreen() {
    const floorTiles = currentRunner.scene.floorTiles;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    cwSetCameraPosition();
    ctx.translate(200 - (camera.pos.x * camera.zoom), 200 + (camera.pos.y * camera.zoom));
    ctx.scale(camera.zoom, -camera.zoom);
    cwDrawFloor(ctx, camera, floorTiles);
    ghostDrawFrame(ctx, ghost, camera);
    cwDrawCars();
    ctx.restore();
}

function toggleDisplay() {
    if (cwPaused) {
        return;
    }
    if (doDraw) {
        doDraw = false;
        cwStopSimulation();
        cwRunningInterval = setInterval(() => {
            const time = performance.now() + (1000 / screenfps);
            while (time > performance.now()) {
                simulationStep();
            }
        }, 1);
    } else {
        doDraw = true;
        clearInterval(cwRunningInterval);
        cwStartSimulation();
    }
}

function cwDrawMiniMap() {
    const floorTiles = currentRunner.scene.floorTiles;
    let last_tile = null;
    let tile_position = new b2Vec2(-5, 0);
    minimapfogdistance = 0;
    fogdistance.width = '800px';
    minimapctx.strokeStyle = '#3F72AF';
    minimapctx.beginPath();
    minimapctx.moveTo(0, 35 * minimapscale);
    for (let k = 0; k < floorTiles.length; k++) {
        last_tile = floorTiles[k];
        const last_fixture = last_tile.GetFixtureList();
        tile_position = last_tile.GetWorldPoint(last_fixture.GetShape().m_vertices[3]);
        minimapctx.lineTo((tile_position.x + 5) * minimapscale, (-tile_position.y + 35) * minimapscale);
    }
    minimapctx.stroke();
}

/* ==== END Drawing ======================================================== */
/* ========================================================================= */
const uiListeners = {
    preCarStep() {
        ghostMoveFrame(ghost);
    },
    carStep(car) {
        updateCarUI(car);
    },
    carDeath(carInfo) {
        const k = carInfo.index;

        let car = carInfo.car,
            score = carInfo.score;
        carMap.get(carInfo).kill(currentRunner, worldDef);

        // refocus camera to leader on death
        if (camera.target === carInfo) {
            cwSetCameraTarget(-1);
        }
        // console.log(score);
        carMap.delete(carInfo);
        ghostCompareToReplay(car.replay, ghost, score.v);
        score.i = generationState.counter;

        cwDeadCars++;
        const generationSize = generationConfig.constants.generationSize;
        document.getElementById('population').innerHTML = (generationSize - cwDeadCars).toString();

        // console.log(leaderPosition.leader, k)
        if (leaderPosition.leader === k) {
            // leader is dead, find new leader
            cwFindLeader();
        }
    },
    generationEnd(results) {
        cleanupRound(results);
        return cwNewRound(results);
    },
};

function simulationStep() {
    currentRunner.step();
    showDistance(
        Math.round(leaderPosition.x * 100) / 100,
        Math.round(leaderPosition.y * 100) / 100
    );
}

function updateCarUI(carInfo) {
    const k = carInfo.index;
    const car = carMap.get(carInfo);
    const position = car.getPosition();

    ghostAddReplayFrame(car.replay, car.car.car);
    car.minimapmarker.style.left = `${Math.round((position.x + 5) * minimapscale)}px`;
    car.healthBar.width = `${Math.round((car.car.state.health / maxCarHealth) * 100)}%`;
    if (position.x > leaderPosition.x) {
        leaderPosition = position;
        leaderPosition.leader = k;
        // console.log("new leader: ", k);
    }
}

function cwFindLeader() {
    const lead = 0;
    const cwCarArray = Array.from(carMap.values());
    for (let k = 0; k < cwCarArray.length; k++) {
        if (!cwCarArray[k].alive) {
            continue;
        }
        const position = cwCarArray[k].getPosition();
        if (position.x > lead) {
            leaderPosition = position;
            leaderPosition.leader = k;
        }
    }
}

function fastForward() {
    const gen = generationState.counter;
    while (gen === generationState.counter) {
        currentRunner.step();
    }
}

function cleanupRound(results) {
    results.sort((a, b) => {
        if (a.score.v > b.score.v) {
            return -1;
        }
        return 1;
    });
    graphState = plotGraphs(
        document.getElementById('graphcanvas'),
        document.getElementById('topscores'),
        null,
        graphState,
        results
    );
}

function cwNewRound(results) {
    camera.pos.x = 0;
    camera.pos.y = 0;
    cwSetCameraTarget(-1);

    generationState = manageRound.nextGeneration(generationState, results, generationConfig());
    if (worldDef.mutableFloor) {
        // GHOST DISABLED
        ghost = null;
        worldDef.floorseed = btoa(Math.seedrandom());
    } else {
        // RE-ENABLE GHOST
        ghostResetGhost(ghost);
    }
    currentRunner = worldRun(worldDef, generationState.generation, uiListeners);
    setupCarUI();
    cwDrawMiniMap();
    resetCarUI();
}

function cwStartSimulation() {
    cwRunningInterval = setInterval(simulationStep, Math.round(1000 / box2dfps));
    cwDrawInterval = setInterval(cwDrawScreen, Math.round(1000 / screenfps));
}

function cwStopSimulation() {
    clearInterval(cwRunningInterval);
    clearInterval(cwDrawInterval);
}

function cwResetPopulationUI() {
    document.getElementById('generation').innerHTML = '';
    document.getElementById('cars').innerHTML = '';
    document.getElementById('topscores').innerHTML = '';
    cwClearGraphics();
    resetGraphState();
}

function cwResetWorld() {
    doDraw = true;
    cwStopSimulation();
    worldDef.floorseed = document.getElementById('newseed').value;
    cwResetPopulationUI();

    Math.seedrandom();
    cwGenerationZero();
    currentRunner = worldRun(worldDef, generationState.generation, uiListeners);

    ghost = ghostCreateGhost();
    resetCarUI();
    setupCarUI();
    cwDrawMiniMap();

    cwStartSimulation();
}

function setupCarUI() {
    currentRunner.cars.map((carInfo) => {
        const car = new cwCar(carInfo, carMap);
        carMap.set(carInfo, car);
        car.replay = ghostCreateReplay();
        ghostAddReplayFrame(car.replay, car.car.car);
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
    cwResetPopulationUI();
    cwGenerationZero();
    ghost = ghostCreateGhost();
    resetCarUI();
});

function saveProgress() {
    localStorage.cw_savedGeneration = JSON.stringify(generationState.generation);
    localStorage.cw_genCounter = generationState.counter;
    localStorage.cw_ghost = JSON.stringify(ghost);
    localStorage.cw_topScores = JSON.stringify(graphState.cw_topScores);
    localStorage.cw_floorSeed = worldDef.floorseed;
}

function restoreProgress() {
    if (typeof localStorage.cw_savedGeneration === 'undefined' || localStorage.cw_savedGeneration === null) {
        alert('No saved progress found');
        return;
    }
    cwStopSimulation();
    generationState.generation = JSON.parse(localStorage.cw_savedGeneration);
    generationState.counter = localStorage.cw_genCounter;
    ghost = JSON.parse(localStorage.cw_ghost);
    graphState.cw_topScores = JSON.parse(localStorage.cw_topScores);
    worldDef.floorseed = localStorage.cw_floorSeed;
    document.getElementById('newseed').value = worldDef.floorseed;

    currentRunner = worldRun(worldDef, generationState.generation, uiListeners);
    cwDrawMiniMap();
    Math.seedrandom();

    resetCarUI();
    cwStartSimulation();
}

document.querySelector('#confirm-reset').addEventListener('click', () => {
    cw_confirmResetWorld();
});

function cw_confirmResetWorld() {
    if (confirm('Really reset world?')) {
        cwResetWorld();
    } else {
        return false;
    }
}

// ghost replay stuff


function cw_pauseSimulation() {
    cwPaused = true;
    clearInterval(cwRunningInterval);
    clearInterval(cwDrawInterval);
    ghostPause(ghost);
}

function cw_resumeSimulation() {
    cwPaused = false;
    ghostResume(ghost);
    cwRunningInterval = setInterval(simulationStep, Math.round(1000 / box2dfps));
    cwDrawInterval = setInterval(cwDrawScreen, Math.round(1000 / screenfps));
}

function cw_startGhostReplay() {
    if (!doDraw) {
        toggleDisplay();
    }
    cw_pauseSimulation();
    cwGhostReplayInterval = setInterval(cwDrawGhostReplay, Math.round(1000 / screenfps));
}

function cw_stopGhostReplay() {
    clearInterval(cwGhostReplayInterval);
    cwGhostReplayInterval = null;
    cwFindLeader();
    camera.pos.x = leaderPosition.x;
    camera.pos.y = leaderPosition.y;
    cw_resumeSimulation();
}

document.querySelector('#toggle-ghost').addEventListener('click', (e) => {
    cw_toggleGhostReplay(e.target);
});

function cw_toggleGhostReplay(button) {
    if (cwGhostReplayInterval === null) {
        cw_startGhostReplay();
        button.value = 'Resume simulation';
    } else {
        cw_stopGhostReplay();
        button.value = 'View top replay';
    }
}

// ghost replay stuff END

// initial stuff, only called once (hopefully)
function cwInit() {
    // clone silver dot and health bar
    const minimapMarker = document.getElementsByName('minimapmarker')[0];
    const healthBar = document.getElementsByName('healthbar')[0];
    const generationSize = generationConfig.constants.generationSize;

    for (let k = 0; k < generationSize; k++) {
        // minimap markers
        const newBar = minimapMarker.cloneNode(true);
        newBar.id = `bar${k}`;
        newBar.style.paddingTop = `${k * 9}px`;
        minimapholder.appendChild(newBar);

        // health bars
        const newHealth = healthBar.cloneNode(true);
        newHealth.getElementsByTagName('DIV')[0].id = `health${k}`;
        newHealth.car_index = k;
        document.getElementById('health').appendChild(newHealth);
    }
    minimapMarker.parentNode.removeChild(minimapMarker);
    healthBar.parentNode.removeChild(healthBar);
    worldDef.floorseed = btoa(Math.seedrandom());
    cwGenerationZero();
    ghost = ghostCreateGhost();
    debugger;
    resetCarUI();
    currentRunner = worldRun(worldDef, generationState.generation, uiListeners);
    setupCarUI();
    cwDrawMiniMap();
    cwRunningInterval = setInterval(simulationStep, Math.round(1000 / box2dfps));
    cwDrawInterval = setInterval(cwDrawScreen, Math.round(1000 / screenfps));
}

function relMouseCoords(event) {
    let totalOffsetX = 0;
    let totalOffsetY = 0;
    let canvasX = 0;
    let canvasY = 0;
    let currentElement = this;

    do {
        totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
        totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
        currentElement = currentElement.offsetParent;
    }
    while (currentElement);

    canvasX = event.pageX - totalOffsetX;
    canvasY = event.pageY - totalOffsetY;

    return { x: canvasX, y: canvasY };
}

HTMLDivElement.prototype.relMouseCoords = relMouseCoords;
minimapholder.onclick = function (event) {
    const coords = minimapholder.relMouseCoords(event);
    const cw_carArray = Array.from(carMap.values());
    const closest = {
        value: cw_carArray[0].car,
        dist: Math.abs(((cw_carArray[0].getPosition().x + 6) * minimapscale) - coords.x),
        x: cw_carArray[0].getPosition().x,
    };

    let maxX = 0;
    for (let i = 0; i < cw_carArray.length; i++) {
        const pos = cw_carArray[i].getPosition();
        const dist = Math.abs(((pos.x + 6) * minimapscale) - coords.x);
        if (dist < closest.dist) {
            closest.value = cw_carArray.car;
            closest.dist = dist;
            closest.x = pos.x;
        }
        maxX = Math.max(pos.x, maxX);
    }

    if (closest.x === maxX) { // focus on leader again
        cwSetCameraTarget(-1);
    } else {
        cwSetCameraTarget(closest.value);
    }
};


document.querySelector('#mutationrate').addEventListener('change', (e) => {
    const elem = e.target;
    cw_setMutation(elem.options[elem.selectedIndex].value);
});

document.querySelector('#mutationsize').addEventListener('change', (e) => {
    const elem = e.target;
    cw_setMutationRange(elem.options[elem.selectedIndex].value);
});

document.querySelector('#floor').addEventListener('change', (e) => {
    const elem = e.target;
    cwSetMutableFloor(elem.options[elem.selectedIndex].value);
});

document.querySelector('#gravity').addEventListener('change', (e) => {
    const elem = e.target;
    cwSetGravity(elem.options[elem.selectedIndex].value);
});

document.querySelector('#elitesize').addEventListener('change', (e) => {
    const elem = e.target;
    cwSetEliteSize(elem.options[elem.selectedIndex].value);
});

function cw_setMutation(mutation) {
    generationConfig.constants.gen_mutation = parseFloat(mutation);
}

function cw_setMutationRange(range) {
    generationConfig.constants.mutation_range = parseFloat(range);
}

function cwSetMutableFloor(choice) {
    worldDef.mutableFloor = (choice === 1);
}

function cwSetGravity(choice) {
    worldDef.gravity = new b2Vec2(0.0, -parseFloat(choice));
    const world = currentRunner.scene.world;
    // CHECK GRAVITY CHANGES
    if (world.GetGravity().y !== worldDef.gravity.y) {
        world.SetGravity(worldDef.gravity);
    }
}

function cwSetEliteSize(clones) {
    generationConfig.constants.championLength = parseInt(clones, 10);
}

cwInit();
