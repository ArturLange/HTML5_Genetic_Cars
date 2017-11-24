let create = require('../create-instance');

module.exports = {
  generationZero,
  nextGeneration
};

function generationZero(config) {
  let generationSize = config.generationSize,
    schema = config.schema;
  let cw_carGeneration = [];
  for (let k = 0; k < generationSize; k++) {
    let def = create.createGenerationZero(schema, () => {
      return Math.random()
    });
    def.index = k;
    cw_carGeneration.push(def);
  }
  return {
    counter: 0,
    generation: cw_carGeneration,
  };
}

function nextGeneration(
  previousState,
  scores,
  config,
) {
  let champion_length = config.championLength,
    generationSize = config.generationSize,
    selectFromAllParents = config.selectFromAllParents;

  let newGeneration = new Array();
  let newborn;
  for (var k = 0; k < champion_length; k++) {
``;
    scores[k].def.is_elite = true;
    scores[k].def.index = k;
    newGeneration.push(scores[k].def);
  }
  let parentList = [];
  for (k = champion_length; k < generationSize; k++) {
    let parent1 = selectFromAllParents(scores, parentList);
    let parent2 = parent1;
    while (parent2 == parent1) {
      parent2 = selectFromAllParents(scores, parentList, parent1);
    }
    let pair = [parent1, parent2];
    parentList.push(pair);
    newborn = makeChild(
config,
      pair.map((parent) => { return scores[parent].def; }),
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
  let schema = config.schema,
    pickParent = config.pickParent;
  return create.createCrossBreed(schema, parents, pickParent);
}


function mutate(config, parent) {
  let schema = config.schema,
    mutation_range = config.mutation_range,
    gen_mutation = config.gen_mutation,
    generateRandom = config.generateRandom;
  return create.createMutatedClone(
    schema,
    generateRandom,
    parent,
    Math.max(mutation_range),
    gen_mutation,
  );
}
