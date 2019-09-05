import { getStatus } from '../car-schema/run';

export class Car {
    car: any;
    car_def: any;
    frames: number;
    alive: boolean;
    is_elite: any;
    healthBar: any;
    healthBarText: any;
    minimapmarker: any;

    constructor(car) {
        this.car = car;
        this.car_def = car.def;
        const car_def = this.car_def;

        this.frames = 0;
        this.alive = true;
        this.is_elite = car.def.is_elite;
        this.healthBar = document.getElementById('health' + car_def.index).style;
        this.healthBarText = document.getElementById(
            'health' + car_def.index,
        ).nextSibling.nextSibling;
        this.healthBarText.innerHTML = car_def.index;
        this.minimapmarker = document.getElementById('bar' + car_def.index);

        if (this.is_elite) {
            this.healthBar.backgroundColor = '#3F72AF';
            this.minimapmarker.style.borderLeft = '1px solid #3F72AF';
            this.minimapmarker.innerHTML = car_def.index;
        } else {
            this.healthBar.backgroundColor = '#F7C873';
            this.minimapmarker.style.borderLeft = '1px solid #F7C873';
            this.minimapmarker.innerHTML = car_def.index;
        }
    }

    kill(currentRunner, constants) {
        this.minimapmarker.style.borderLeft = '1px solid #3F72AF';
        const finishLine = currentRunner.scene.finishLine;
        const max_car_health = constants.max_car_health;
        const status = getStatus(this.car.state, {
            finishLine,
            max_car_health,
        });
        switch (status) {
        case 1: {
            this.healthBar.width = '0';
            break;
        }
        case -1: {
            this.healthBarText.innerHTML = '&dagger;';
            this.healthBar.width = '0';
            break;
        }
        }
        this.alive = false;
    }

    getPosition() {
        return this.car.car.chassis.GetPosition();
    }
}
