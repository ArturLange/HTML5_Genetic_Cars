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
const cw_clearGraphics = graphFns.clearGraphics;
const cw_drawFloor = require('./draw/draw-floor.js');

const ghost_draw_frame = ghostFns.ghostDrawFrame;
const ghost_create_ghost = ghostFns.ghostCreateGhost;
const ghost_add_replay_frame = ghostFns.ghostAddReplayFrame;
const ghost_compare_to_replay = ghostFns.ghostCompareToReplay;
const ghost_get_position = ghostFns.ghostGetPosition;
const ghost_move_frame = ghostFns.ghostMoveFrame;
const ghost_reset_ghost = ghostFns.ghostResetGhost;
const ghost_pause = ghostFns.ghostPause;
const ghost_resume = ghostFns.ghostResume;
const ghost_create_replay = ghostFns.ghostCreateReplay;

const cw_Car = require('./draw/draw-car-stats.js');

let ghost;
const carMap = new Map();

let doDraw = true;
let cw_paused = false;

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

minimapcamera.width = `${12 * minimapscale  }px`;
minimapcamera.height = `${6 * minimapscale  }px`;


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

let cw_deadCars;
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
let cw_runningInterval;
let cw_drawInterval;
let currentRunner;

function showDistance(distance, height) {
  distanceMeter.innerHTML = `${distance  } meters<br />`;
  heightMeter.innerHTML = `${height  } meters`;
  if (distance > minimapfogdistance) {
    fogdistance.width = `${800 - Math.round(distance + 15) * minimapscale  }px`;
    minimapfogdistance = distance;
  }
}


/* === END Car ============================================================= */
/* ========================================================================= */


/* ========================================================================= */
/* ==== Generation ========================================================= */

function cw_generationZero() {
  generationState = manageRound.generationZero(generationConfig());
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
  const floorTiles = currentRunner.scene.floorTiles;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  cw_setCameraPosition();
  const camera_x = camera.pos.x;
  const camera_y = camera.pos.y;
  const zoom = camera.zoom;
  ctx.translate(200 - (camera_x * zoom), 200 + (camera_y * zoom));
  ctx.scale(zoom, -zoom);
  cw_drawFloor(ctx, camera, floorTiles);
  ghost_draw_frame(ctx, ghost, camera);
  cw_drawCars();
  ctx.restore();
}

function cw_minimapCamera(/* x, y */) {
  const camera_x = camera.pos.x;
  const camera_y = camera.pos.y;
  minimapcamera.left = `${Math.round((2 + camera_x) * minimapscale)  }px`;
  minimapcamera.top = `${Math.round((31 - camera_y) * minimapscale)  }px`;
}

function cw_setCameraTarget(k) {
  camera.target = k;
}

function cw_setCameraPosition() {
  let cameraTargetPosition;
  if (camera.target !== -1) {
    cameraTargetPosition = carMap.get(camera.target).getPosition();
  } else {
    cameraTargetPosition = leaderPosition;
  }
  let diff_y = camera.pos.y - cameraTargetPosition.y;
  let diff_x = camera.pos.x - cameraTargetPosition.x;
  camera.pos.y -= camera.speed * diff_y;
  camera.pos.x -= camera.speed * diff_x;
  cw_minimapCamera(camera.pos.x, camera.pos.y);
}

function cw_drawGhostReplay() {
  let floorTiles = currentRunner.scene.floorTiles;
  let carPosition = ghost_get_position(ghost);
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
  cw_drawFloor(ctx, camera, floorTiles);
  ctx.restore();
}


function cw_drawCars() {
  let cw_carArray = Array.from(carMap.values());
  for (let k = (cw_carArray.length - 1); k >= 0; k--) {
    let myCar = cw_carArray[k];
    drawCar(carConstants, myCar, camera, ctx);
  }
}

function toggleDisplay() {
  if (cw_paused) {
    return;
  }
  if (doDraw) {
    doDraw = false;
    cw_stopSimulation();
    cw_runningInterval = setInterval(() => {
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
  let floorTiles = currentRunner.scene.floorTiles;
  let last_tile = null;
  let tile_position = new b2Vec2(-5, 0);
  minimapfogdistance = 0;
  fogdistance.width = '800px';
  minimapctx.strokeStyle = '#3F72AF';
  minimapctx.beginPath();
  minimapctx.moveTo(0, 35 * minimapscale);
  for (let k = 0; k < floorTiles.length; k++) {
    last_tile = floorTiles[k];
    let last_fixture = last_tile.GetFixtureList();
    tile_position = last_tile.GetWorldPoint(last_fixture.GetShape().m_vertices[3]);
    minimapctx.lineTo((tile_position.x + 5) * minimapscale, (-tile_position.y + 35) * minimapscale);
  }
  minimapctx.stroke();
}

/* ==== END Drawing ======================================================== */
/* ========================================================================= */
let uiListeners = {
  preCarStep(){
    ghost_move_frame(ghost);
  },
  carStep(car){
    updateCarUI(car);
  },
  carDeath(carInfo){

    var k = carInfo.index;

    var car = carInfo.car, score = carInfo.score;
    carMap.get(carInfo).kill(currentRunner, worldDef);

    // refocus camera to leader on death
    if (camera.target === carInfo) {
      cw_setCameraTarget(-1);
    }
    // console.log(score);
    carMap.delete(carInfo);
    ghost_compare_to_replay(car.replay, ghost, score.v);
    score.i = generationState.counter;

    cw_deadCars++;
    var generationSize = generationConfig.constants.generationSize;
    document.getElementById("population").innerHTML = (generationSize - cw_deadCars).toString();

    // console.log(leaderPosition.leader, k)
    if (leaderPosition.leader === k) {
      // leader is dead, find new leader
      cw_findLeader();
    }
  },
  generationEnd(results){
    cleanupRound(results);
    return cw_newRound(results);
  }
};
function simulationStep() {
  currentRunner.step();
  showDistance(
    Math.round(leaderPosition.x * 100) / 100,
    Math.round(leaderPosition.y * 100) / 100,
  );
}

function updateCarUI(carInfo) {
  let k = carInfo.index;
  let car = carMap.get(carInfo);
  let position = car.getPosition();

  ghost_add_replay_frame(car.replay, car.car.car);
  car.minimapmarker.style.left = `${Math.round((position.x + 5) * minimapscale)  }px`;
  car.healthBar.width = `${Math.round((car.car.state.health / maxCarHealth) * 100)  }%`;
  if (position.x > leaderPosition.x) {
    leaderPosition = position;
    leaderPosition.leader = k;
    // console.log("new leader: ", k);
  }
}

function cw_findLeader() {
  let lead = 0;
  let cw_carArray = Array.from(carMap.values());
  for (let k = 0; k < cw_carArray.length; k++) {
    if (!cw_carArray[k].alive) {
      continue;
    }
    let position = cw_carArray[k].getPosition();
    if (position.x > lead) {
      leaderPosition = position;
      leaderPosition.leader = k;
    }
  }
}

function fastForward() {
  let gen = generationState.counter;
  while (gen === generationState.counter) {
    currentRunner.step();
  }
}

function cleanupRound(results) {
  results.sort(function (a, b) {
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
    results,
  );
}

function cw_newRound(results) {
  camera.pos.x = camera.pos.y = 0;
  cw_setCameraTarget(-1);

  generationState = manageRound.nextGeneration(generationState, results, generationConfig(),
  );
  if (worldDef.mutableFloor) {
    // GHOST DISABLED
    ghost = null;
    worldDef.floorseed = btoa(Math.seedrandom());
  } else {
    // RE-ENABLE GHOST
    ghost_reset_ghost(ghost);
  }
  currentRunner = worldRun(worldDef, generationState.generation, uiListeners);
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
  cw_clearGraphics();
  resetGraphState();
}

function cw_resetWorld() {
  doDraw = true;
  cw_stopSimulation();
  worldDef.floorseed = document.getElementById('newseed').value;
  cw_resetPopulationUI();

  Math.seedrandom();
  cw_generationZero();
  currentRunner = worldRun(worldDef, generationState.generation, uiListeners,
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
  localStorage.cw_floorSeed = worldDef.floorseed;
}

function restoreProgress() {
  if (typeof localStorage.cw_savedGeneration === 'undefined' || localStorage.cw_savedGeneration === null) {
    alert('No saved progress found');
    return;
  }
  cw_stopSimulation();
  generationState.generation = JSON.parse(localStorage.cw_savedGeneration);
  generationState.counter = localStorage.cw_genCounter;
  ghost = JSON.parse(localStorage.cw_ghost);
  graphState.cw_topScores = JSON.parse(localStorage.cw_topScores);
  worldDef.floorseed = localStorage.cw_floorSeed;
  document.getElementById('newseed').value = worldDef.floorseed;

  currentRunner = worldRun(worldDef, generationState.generation, uiListeners);
  cw_drawMiniMap();
  Math.seedrandom();

  resetCarUI();
  cw_startSimulation();
}

document.querySelector('#confirm-reset').addEventListener('click', () => {
  cw_confirmResetWorld()
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
  cw_paused = true;
  clearInterval(cw_runningInterval);
  clearInterval(cw_drawInterval);
  ghost_pause(ghost);
}

function cw_resumeSimulation() {
  cw_paused = false;
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
  cw_toggleGhostReplay(e.target)
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
function cw_init() {
  // clone silver dot and health bar
  let mmm = document.getElementsByName('minimapmarker')[0];
  let hbar = document.getElementsByName('healthbar')[0];
  let generationSize = generationConfig.constants.generationSize;

  for (let k = 0; k < generationSize; k++) {
    // minimap markers
    let newbar = mmm.cloneNode(true);
    newbar.id = 'bar' + k;
    newbar.style.paddingTop = `${k * 9  }px`;
    minimapholder.appendChild(newbar);

    // health bars
    let newhealth = hbar.cloneNode(true);
    newhealth.getElementsByTagName('DIV')[0].id = 'health' + k;
    newhealth.car_index = k;
    document.getElementById('health').appendChild(newhealth);
  }
  mmm.parentNode.removeChild(mmm);
  hbar.parentNode.removeChild(hbar);
  worldDef.floorseed = btoa(Math.seedrandom());
  cw_generationZero();
  ghost = ghost_create_ghost();
  resetCarUI();
  currentRunner = worldRun(worldDef, generationState.generation, uiListeners);
  setupCarUI();
  cw_drawMiniMap();
  cw_runningInterval = setInterval(simulationStep, Math.round(1000 / box2dfps));
  cw_drawInterval = setInterval(cw_drawScreen, Math.round(1000 / screenfps));
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
  let coords = minimapholder.relMouseCoords(event);
  let cw_carArray = Array.from(carMap.values());
  let closest = {
    value: cw_carArray[0].car,
    dist: Math.abs(((cw_carArray[0].getPosition().x + 6) * minimapscale) - coords.x),
    x: cw_carArray[0].getPosition().x,
  };

  let maxX = 0;
  for (let i = 0; i < cw_carArray.length; i++) {
    let pos = cw_carArray[i].getPosition();
    let dist = Math.abs(((pos.x + 6) * minimapscale) - coords.x);
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
  var elem = e.target;
  cw_setMutation(elem.options[elem.selectedIndex].value)
});

document.querySelector('#mutationsize').addEventListener('change', (e) => {
  var elem = e.target;
  cw_setMutationRange(elem.options[elem.selectedIndex].value)
});

document.querySelector('#floor').addEventListener('change', (e) => {
  var elem = e.target;
  cw_setMutableFloor(elem.options[elem.selectedIndex].value)
});

document.querySelector('#gravity').addEventListener('change', (e) => {
  var elem = e.target;
  cw_setGravity(elem.options[elem.selectedIndex].value)
});

document.querySelector('#elitesize').addEventListener('change', (e) => {
  var elem = e.target;
  cw_setEliteSize(elem.options[elem.selectedIndex].value)
});

function cw_setMutation(mutation) {
  generationConfig.constants.gen_mutation = parseFloat(mutation);
}

function cw_setMutationRange(range) {
  generationConfig.constants.mutation_range = parseFloat(range);
}

function cw_setMutableFloor(choice) {
  worldDef.mutableFloor = (choice === 1);
}

function cw_setGravity(choice) {
  worldDef.gravity = new b2Vec2(0.0, -parseFloat(choice));
  let world = currentRunner.scene.world;
  // CHECK GRAVITY CHANGES
  if (world.GetGravity().y !== worldDef.gravity.y) {
    world.SetGravity(worldDef.gravity);
  }
}

function cw_setEliteSize(clones) {
  generationConfig.constants.championLength = parseInt(clones, 10);
}

cw_init();
