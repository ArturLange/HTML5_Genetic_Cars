const create = require('../create-instance');

module.exports = {
    generationZero,
    nextGeneration,
};

function generationZero(config) {
    const oldStructure = create.createGenerationZero(config.schema, config.generateRandom);
    const newStructure = createStructure(config, 1, oldStructure);

    const k = 0;

    return {
        counter: 0,
        k,
        generation: [newStructure, oldStructure],
    };
}

function nextGeneration(previousState, scores, config) {
    const nextState = {
        k: (previousState.k + 1) % config.generationSize,
        counter: previousState.counter + (previousState.k === config.generationSize ? 1 : 0),
    };
    // gradually get closer to zero temperature (but never hit it)
    const oldDef = previousState.curDef || previousState.generation[1];
    const oldScore = previousState.score || scores[1].score.v;

    const newDef = previousState.generation[0];
    const newScore = scores[0].score.v;


    const temp = Math.pow(Math.E, -nextState.counter / config.generationSize);

    const scoreDiff = newScore - oldScore;
    // If the next point is higher, change location
    if (scoreDiff > 0) {
        nextState.curDef = newDef;
        nextState.score = newScore;
    // Else we want to increase likelyhood of changing location as we get
    } else if (Math.random() > Math.exp(-scoreDiff / (nextState.k * temp))) {
        nextState.curDef = newDef;
        nextState.score = newScore;
    } else {
        nextState.curDef = oldDef;
        nextState.score = oldScore;
    }

    console.log(previousState, nextState);

    nextState.generation = [createStructure(config, temp, nextState.curDef)];

    return nextState;
}


function createStructure(config, mutationRange, parent) {
    const schema = config.schema,
        genMutation = 1,
        generateRandom = config.generateRandom;
    return create.createMutatedClone(
        schema,
        generateRandom,
        parent,
        mutationRange,
        genMutation,
    );
}
