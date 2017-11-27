import { defToCar } from '../car-schema/def-to-car';
import { calculateScore, getStatus, updateState, getInitialState } from '../car-schema/run';
import { setupScene } from './setup-scene';

export function runDefs(worldDef, defs, listeners) {
    if (worldDef.mutable_floor) {
        // GHOST DISABLED
        worldDef.floorseed = btoa(Math.seedrandom());
    }

    const scene = setupScene(worldDef);
    scene.world.Step(1 / worldDef.box2dfps, 20, 20);
    console.log('about to build cars');
    const cars = defs.map((def, i) => {
        return {
            def,
            index: i,
            car: defToCar(def, scene.world, worldDef),
            state: getInitialState(worldDef),
        };
    });
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
                car.state = updateState(
                    worldDef, car.car, car.state,
                );
                const status = getStatus(car.state, worldDef);
                listeners.carStep(car);
                if (status === 0) {
                    return true;
                }
                car.score = calculateScore(car.state, worldDef);
                listeners.carDeath(car);

                const world = scene.world;
                const worldCar = car.car;
                world.DestroyBody(worldCar.chassis);

                for (let w = 0; w < worldCar.wheels.length; w += 1) {
                    world.DestroyBody(worldCar.wheels[w]);
                }

                return false;
            });
            if (alivecars.length === 0) {
                listeners.generationEnd(cars);
            }
        },
    };
}
