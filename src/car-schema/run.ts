export function getInitialState(worldDef) {
    return {
        frames: 0,
        health: worldDef.max_car_health,
        maxPositiony: 0,
        minPositiony: 0,
        maxPositionx: 0,
    };
}

interface State {
    frames: any;
    maxPositionx: any;
    maxPositiony: any;
    minPositiony: any;
    health?: any;
}

export function updateState(constants, worldConstruct, state) {
    if (state.health <= 0) {
        throw new Error('Already Dead');
    }
    if (state.maxPositionx > constants.finishLine) {
        throw new Error('already Finished');
    }

    // console.log(state);
    // check health
    var position = worldConstruct.chassis.GetPosition();
    // check if car reached end of the path
    var nextState: State = {
        frames: state.frames + 1,
        maxPositionx: position.x > state.maxPositionx ? position.x : state.maxPositionx,
        maxPositiony: position.y > state.maxPositiony ? position.y : state.maxPositiony,
        minPositiony: position.y < state.minPositiony ? position.y : state.minPositiony,
    };

    if (position.x > constants.finishLine) {
        return nextState;
    }

    if (position.x > state.maxPositionx + 0.02) {
        nextState.health = constants.max_car_health;
        return nextState;
    }
    nextState.health = state.health - 1;
    if (Math.abs(worldConstruct.chassis.GetLinearVelocity().x) < 0.001) {
        nextState.health -= 5;
    }
    return nextState;
}

export function getStatus(state, constants): number {
    if (hasFailed(state)) {
        return -1;
    }
    if (hasSuccess(state, constants)) {
        return 1;
    }
    return 0;
}

export function hasFailed(state): boolean {
    return state.health <= 0;
}

export function hasSuccess(state, constants): boolean {
    return state.maxPositionx > constants.finishLine;
}

export function calculateScore(state, constants) {
    const averageSpeed = (state.maxPositionx / state.frames) * constants.box2dfps;
    const position = state.maxPositionx;
    const score = position + averageSpeed;
    return {
        v: score,
        s: averageSpeed,
        x: position,
        y: state.maxPositiony,
        y2: state.minPositiony,
    };
}
