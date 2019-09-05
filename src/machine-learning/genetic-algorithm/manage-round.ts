import { createGenerationZero, createMutatedClone, createCrossBreed } from '../create-instance';

export function generationZero(config) {
    const generationSize = config.generationSize;
    const schema = config.schema;
    const cwCarGeneration = [];
    for (let k = 0; k < generationSize; k += 1) {
        const def = createGenerationZero(schema, () => Math.random());
        def.index = k;
        cwCarGeneration.push(def);
    }
    return {
        counter: 0,
        generation: cwCarGeneration,
    };
}

export function nextGeneration(previousState,
                               scores,
                               config) {
    const championLength = config.championLength;
    const generationSize = config.generationSize;
    const selectFromAllParents = config.selectFromAllParents;

    const newGeneration = [];
    let newborn;
    for (let k = 0; k < championLength; k += 1) {
        ``;
        scores[k].def.is_elite = true;
        scores[k].def.index = k;
        newGeneration.push(scores[k].def);
    }
    const parentList = [];
    for (let k = championLength; k < generationSize; k += 1) {
        const parent1 = selectFromAllParents(scores, parentList);
        let parent2 = parent1;
        while (parent2 === parent1) {
            parent2 = selectFromAllParents(scores, parentList, parent1);
        }
        const pair = [parent1, parent2];
        parentList.push(pair);
        newborn = makeChild(config,
            pair.map(parent => scores[parent].def),
        );
        newborn = mutate(config, newborn);
        newborn.is_elite = false;
        newborn.index = k;
        newGeneration.push(newborn);
    }

    return {
        counter: previousState.counter + 1,
        generation: newGeneration,
    };
}

function makeChild(config, parents) {
    const schema = config.schema;
    const pickParent = config.pickParent;
    return createCrossBreed(schema, parents, pickParent);
}

function mutate(config, parent) {
    const schema = config.schema;
    const mutation_range = config.mutation_range;
    const gen_mutation = config.gen_mutation;
    const generateRandom = config.generateRandom;
    return createMutatedClone(
        schema,
        generateRandom,
        parent,
        Math.max(mutation_range),
        gen_mutation,
    );
}
