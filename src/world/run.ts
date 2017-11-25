/* globals btoa */
import setupScene = require('./setup-scene');
import carRun = require('../car-schema/run');
import { defToCar } from '../car-schema/def-to-car';

export function runDefs(world_def, defs, listeners) {
    if (world_def.mutable_floor) {
        // GHOST DISABLED
        world_def.floorseed = btoa(Math.seedrandom());
    }

    var scene = setupScene(world_def);
    scene.world.Step(1 / world_def.box2dfps, 20, 20);
    console.log('about to build cars');
    var cars = defs.map((def, i) => {
        return {
            index: i,
            def: def,
            car: defToCar(def, scene.world, world_def),
            state: carRun.getInitialState(world_def),
        };
    });
    var alivecars = cars;
    return {
        scene,
        cars,
        step: function () {
            if (alivecars.length === 0) {
                throw new Error('no more cars');
            }
            scene.world.Step(1 / world_def.box2dfps, 20, 20);
            listeners.preCarStep();
            alivecars = alivecars.filter((car) => {
                car.state = carRun.updateState(
                    world_def, car.car, car.state,
                );
                var status = carRun.getStatus(car.state, world_def);
                listeners.carStep(car);
                if (status === 0) {
                    return true;
                }
                car.score = carRun.calculateScore(car.state, world_def);
                listeners.carDeath(car);

                var world = scene.world;
                var worldCar = car.car;
                world.DestroyBody(worldCar.chassis);

                for (var w = 0; w < worldCar.wheels.length; w += 1) {
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
