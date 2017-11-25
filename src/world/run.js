/* globals btoa */
const setupScene = require('./setup-scene');
const carRun = require('../car-schema/run');
const defToCar = require('../car-schema/def-to-car');

function runDefs(worldDef, defs, listeners) {
    if (worldDef.mutableFloor) {
    // GHOST DISABLED
        worldDef.floorseed = btoa(Math.seedrandom());
    }

    const scene = setupScene(worldDef);
    scene.world.Step(1 / worldDef.box2dfps, 20, 20);
    console.log('about to build cars');
    const cars = defs.map((def, i) => ({
        index: i,
        def,
        car: defToCar(def, scene.world, worldDef),
        state: carRun.getInitialState(worldDef),
    }));
    let alivecars = cars;
    return {
        scene,
        cars,
        step() {
            if (alivecars.length === 0) {
                throw new Error('no more cars');
            }
            scene.world.Step(1 / worldDef.box2dfps, 20, 20);
            listeners.preCarStep();
            alivecars = alivecars.filter((car) => {
                car.state = carRun.updateState(worldDef, car.car, car.state);
                const status = carRun.getStatus(car.state, worldDef);
                listeners.carStep(car);
                if (status === 0) {
                    return true;
                }
                car.score = carRun.calculateScore(car.state, worldDef);
                listeners.carDeath(car);

                const worldCar = car.car;
                scene.world.DestroyBody(worldCar.chassis);

                for (let w = 0; w < worldCar.wheels.length; w++) {
                    scene.world.DestroyBody(worldCar.wheels[w]);
                }

                return false;
            });
            if (alivecars.length === 0) {
                listeners.generationEnd(cars);
            }
        },
    };
}

module.exports = runDefs;
